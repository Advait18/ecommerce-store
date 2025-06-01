import { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

async function authorizeUser(email: string, password: string): Promise<NextAuthUser | null> {
  if (email === "admin@example.com" && password === "hunter2") {
    return {
      id: "1",
      name: "Admin User",
      email,
    };
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const user = await authorizeUser(
          credentials.email,
          credentials.password
        );
        return user; // returns { id, name?, email? } or null
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes in seconds
    updateAge: 15 * 60,
  },

  callbacks: {
    jwt: async ({
      token,
      user,
    }: {
      token: JWT
      user?: NextAuthUser | null
    }): Promise<JWT> => {
      if (user) {
        token.sub = user.id
        token.email = user.email
      }
      return token;
    },

    session: async ({
      session,
      token,
    }: {
      session: Session,
      token: JWT,
    }): Promise<Session> => {
      if (session.user) {
        ; (session.user as any).id = token.sub as string
          ; (session.user as any).email = token.email as string
      }
      return session;
    },
  },
}
