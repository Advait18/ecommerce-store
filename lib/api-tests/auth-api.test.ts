import { describe, test, expect } from "vitest";
import type { JWT } from "next-auth/jwt";
import type { Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authOptions } from "../../app/api/auth/[...nextauth]/options";

describe("NextAuth Options", () => {
  describe("CredentialsProvider authorize()", () => {
    const provider = authOptions.providers[0] as ReturnType<typeof CredentialsProvider>;
    const authorize = provider.options.authorize!;

    test("returns a user object when valid credentials are supplied", async () => {
      const validCredentials = { email: "admin@example.com", password: "hunter2" };
      const user = await authorize(validCredentials);
      expect(user).not.toBeNull();
      expect(user).toHaveProperty("id", "1");
      expect(user).toHaveProperty("email", "admin@example.com");
      expect(user).toHaveProperty("name", "Admin User");
    });

    test("returns null when an incorrect password is supplied", async () => {
      const badPassword = { email: "admin@example.com", password: "wrong" };
      const result = await authorize(badPassword);
      expect(result).toBeNull();
    });

    test("returns null when an unknown email is supplied", async () => {
      const badEmail = { email: "someone@example.com", password: "hunter2" };
      const result = await authorize(badEmail);
      expect(result).toBeNull();
    });

    test("returns null when credentials is undefined", async () => {
      const result = await authorize(undefined);
      expect(result).toBeNull();
    });
  });

  describe("callbacks.jwt()", () => {
    const jwtCallback = authOptions.callbacks!.jwt!;

    test("attaches sub and email when a user object is present", async () => {
      const initialToken: JWT = { someField: "value" };
      const nextAuthUser: NextAuthUser = { id: "42", name: "Foo", email: "foo@example.com" };

      const returned = await jwtCallback({
        token: initialToken,
        user: nextAuthUser,
        account: null,
        profile: undefined,
        isNewUser: undefined,
        trigger: undefined,
        session: undefined,
      } as any);

      expect(returned.sub).toBe("42");
      expect(returned.email).toBe("foo@example.com");
      expect(returned.someField).toBe("value");
    });

    test("does not modify token when user is undefined", async () => {
      const initialToken: JWT = { x: "y", sub: "old", email: "old@ex.com" };

        const returned = await jwtCallback({
        token: initialToken,
        user: undefined,
        account: null,
        profile: undefined,
        isNewUser: undefined,
        trigger: undefined,
        session: undefined,
      } as any);

      expect(returned.sub).toBe("old");
      expect(returned.email).toBe("old@ex.com");
      expect(returned.x).toBe("y");
    });
  });

  describe("callbacks.session()", () => {
    const sessionCallback = authOptions.callbacks!.session!;

    test("injects id and email into session.user when token has sub/email", async () => {
      const initialSession: Session = {
        user: { name: "Bar", email: "ignored@ex.com" },
        expires: "never",
      };
      const token: JWT = { sub: "99", email: "alice@ex.com" };

      const returned = await sessionCallback({
        session: initialSession,
        token,
        user: {} as any,
      } as any);

      expect(returned.user).toBeDefined();
      expect((returned.user as any).id).toBe("99");
      expect((returned.user as any).email).toBe("alice@ex.com");
      expect(returned.user!.name).toBe("Bar");
    });

    test("returns session unchanged if session.user is falsy", async () => {
      const initialSession: Session = { expires: "never", user: undefined };
      const token: JWT = { sub: "123", email: "bob@ex.com" };

      const returned = await sessionCallback({
        session: initialSession,
        token,
        user: {} as any,
      } as any);

      expect(returned).toEqual(initialSession);
    });
  });

  describe("session configuration", () => {
    test("uses JWT strategy with 30*60 maxAge and 15*60 updateAge", () => {
      expect(authOptions.session).toBeDefined();
      expect(authOptions.session!.strategy).toBe("jwt");
      expect(authOptions.session!.maxAge).toBe(30 * 60);
      expect(authOptions.session!.updateAge).toBe(15 * 60);
    });
  });
});