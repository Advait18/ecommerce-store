"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

const DEFAULT_IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function useIdleLogout(timeoutMs: number = DEFAULT_IDLE_TIMEOUT) {
    const { data: session, status } = useSession();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (status !== "authenticated") return;

        // Clears any existing timer
        const clearExistingTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        // Starts a new timer
        const startIdleTimer = () => {
            clearExistingTimer();
            timerRef.current = setTimeout(() => {
                signOut({ callbackUrl: "/" });
            }, timeoutMs);
        };

        const events = [
            "mousemove",
            "mousedown",
            "click",
            "scroll",
            "keypress",
            "touchstart",
        ];
        for (const evt of events) {
            window.addEventListener(evt, startIdleTimer);
        }

        startIdleTimer();

        return () => {
            clearExistingTimer();
            for (const evt of events) {
                window.removeEventListener(evt, startIdleTimer);
            }
        };
    }, [session, status, timeoutMs]);
};
