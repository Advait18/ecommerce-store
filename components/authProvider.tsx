"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { useIdleLogout } from "../hooks/use-idleLogout";

interface AuthProviderProps {
    children: ReactNode,
};

function IdleLogoutWrapper({ children }: { children: ReactNode }) {
    // Log out if no activity for 15 minutes
    useIdleLogout(15 * 60 * 1000);
    return <>{children}</>;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    return (
        <SessionProvider>
            <IdleLogoutWrapper>{children}</IdleLogoutWrapper>
        </SessionProvider>
    );
}
