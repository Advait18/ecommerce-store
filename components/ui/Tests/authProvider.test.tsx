import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("../../../hooks/use-idleLogout.ts", () => {
    return {
        useIdleLogout: (timeoutMs: number) => {
            mockUseIdleLogout(timeoutMs);
        },
    };
});
const mockUseIdleLogout = vi.fn();

vi.mock("next-auth/react", () => {
    return {
        SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        useSession: () => ({ data: null, status: "unauthenticated" }),
    };
});

import AuthProvider from "../../authProvider";

describe("<AuthProvider />", () => {
    beforeEach(() => {
        mockUseIdleLogout.mockReset();
    });

    test("renders its children inside SessionProvider and IdleLogoutWrapper", () => {
        render(
            <AuthProvider>
                <div data-testid="child">Hello, User!</div>
            </AuthProvider>
        );

        const child = screen.getByTestId("child");
        expect(child).toBeTruthy();
        expect(child.textContent).toBe("Hello, User!");
    });

    test("calls useIdleLogout with exactly 15 minutes (900000 ms)", () => {
        render(
            <AuthProvider>
                <span>dummy</span>
            </AuthProvider>
        );

        expect(mockUseIdleLogout).toHaveBeenCalledTimes(1);
        expect(mockUseIdleLogout).toHaveBeenCalledWith(15 * 60 * 1000);
    });
});