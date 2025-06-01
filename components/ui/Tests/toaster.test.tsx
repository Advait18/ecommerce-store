import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

const mockToasts: Array<{
    id: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    open: boolean;
    variant?: string;
}> = [];

vi.mock("@/hooks/use-toast", () => ({
    useToast: () => ({ toasts: mockToasts }),
}));

import { Toaster } from "../toaster";

describe("<Toaster />", () => {
    test("renders only the ToastViewport when there are no toasts", () => {
        mockToasts.length = 0;
        render(<Toaster />);

        expect(screen.queryByText(/Test Title/)).toBeNull();
        expect(screen.queryByText(/Test description text/)).toBeNull();

        const viewport = document.querySelector(".fixed");
        expect(viewport).toBeTruthy();
    });

    test("renders a Toast with title, description, action, and close button", () => {

        mockToasts.length = 0;
        mockToasts.push({
            id: "toast-1",
            title: "Test Title",
            description: "Test description text",
            action: <button data-testid="toast-action">Action</button>,
            open: true,
            variant: "default",
        });

        render(<Toaster />);

        const titleElem = screen.getByText("Test Title");
        expect(titleElem).toBeTruthy();

        const descElem = screen.getByText("Test description text");
        expect(descElem).toBeTruthy();

        const actionBtn = screen.getByTestId("toast-action");
        expect(actionBtn).toBeTruthy();
        expect(actionBtn.textContent).toBe("Action");

        const closeBtn = document.querySelector("[toast-close]");
        expect(closeBtn).toBeTruthy();

        const viewport = document.querySelector(".fixed");
        expect(viewport).toBeTruthy();
    });
});