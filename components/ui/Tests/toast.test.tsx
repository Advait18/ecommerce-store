import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

vi.mock("@radix-ui/react-toast", () => ({
    __esModule: true,
    Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Viewport: React.forwardRef<any, any>(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>
            {children}
        </div>
    )),
    Root: React.forwardRef<any, any>(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>
            {children}
        </div>
    )),
    Title: React.forwardRef<any, any>(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>
            {children}
        </div>
    )),
    Description: React.forwardRef<any, any>(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>
            {children}
        </div>
    )),
    Action: React.forwardRef<any, any>(({ children, altText, ...props }, ref) => (
        <button aria-label={altText} ref={ref} {...props}>
            {children}
        </button>
    )),
    Close: React.forwardRef<any, any>(({ children, ...props }, ref) => (
        <button toast-close="" ref={ref} {...props}>
            {children}
        </button>
    )),
}));

import {
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastAction,
    ToastClose,
} from "../toast";

describe("Toast component suite", () => {
    test("ToastProvider renders its children", () => {
        render(
            <ToastProvider>
                <div data-testid="child">Hello</div>
            </ToastProvider>
        );
        const child = screen.getByTestId("child");
        expect(child.textContent).toBe("Hello");
    });

    test("ToastViewport applies default and custom classes", () => {
        render(<ToastViewport className="custom-viewport" />);

        const viewport = document.querySelector(".custom-viewport") as HTMLElement;
        expect(viewport).not.toBeNull();
        expect(viewport.className).toContain("custom-viewport");
        expect(viewport.className).toContain("fixed");
    });

    test("Toast renders default variant classes and children", () => {
        render(<Toast>Notification</Toast>);
        const toastDiv = screen.getByText("Notification").closest("div") as HTMLElement;
        expect(toastDiv).not.toBeNull();

        expect(toastDiv.className).toContain("bg-background");
        expect(toastDiv.className).toContain("text-foreground");
        expect(toastDiv.textContent).toContain("Notification");
    });

    test("Toast renders destructive variant classes", () => {
        render(<Toast variant="destructive">Error occurred</Toast>);
        const toastDiv = screen.getByText("Error occurred").closest("div") as HTMLElement;
        expect(toastDiv).not.toBeNull();
        expect(toastDiv.className).toContain("bg-destructive");
        expect(toastDiv.className).toContain("text-destructive-foreground");
    });

    test("ToastTitle renders text with correct class", () => {
        render(<ToastTitle>Title Text</ToastTitle>);
        const titleDiv = screen.getByText("Title Text") as HTMLElement;
        expect(titleDiv).not.toBeNull();
        expect(titleDiv.className).toContain("font-semibold");
        expect(titleDiv.textContent).toBe("Title Text");
    });

    test("ToastDescription renders text with correct class", () => {
        render(<ToastDescription>Description Text</ToastDescription>);
        const descDiv = screen.getByText("Description Text") as HTMLElement;
        expect(descDiv).not.toBeNull();
        expect(descDiv.className).toContain("opacity-90");
        expect(descDiv.textContent).toBe("Description Text");
    });

    test("ToastAction renders a button with correct attributes and text", () => {
        render(<ToastAction altText="undo-button">Undo</ToastAction>);
        const actionBtn = screen.getByRole("button", { name: "undo-button" }) as HTMLElement;
        expect(actionBtn).not.toBeNull();
        expect(actionBtn.className).toContain("inline-flex");
        expect(actionBtn.textContent).toBe("Undo");
    });

    test("ToastClose renders a close button with X icon inside", () => {
        render(<ToastClose />);
        const closeBtn = document.querySelector('[toast-close]') as HTMLElement;

        expect(closeBtn).not.toBeNull();

        const svg = closeBtn.querySelector("svg");
        expect(svg).not.toBeNull();
        expect(svg?.getAttribute("class")).toContain("h-4");
        expect(svg?.getAttribute("class")).toContain("w-4");
    });
});