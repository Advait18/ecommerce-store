import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { Button, buttonVariants } from "../button";

describe("<Button />", () => {
    test("renders as <button> by default with default variant & size classes", () => {
        render(<Button>Click Me</Button>);
        const btn = screen.getByText("Click Me");

        expect(btn.tagName).toBe("BUTTON");

        expect(btn.getAttribute("data-slot")).toBe("button");

        expect(btn.className).toContain("bg-primary");
        expect(btn.className).toContain("hover:bg-primary/90");

        expect(btn.className).toContain("h-9");
        expect(btn.className).toContain("px-4");
    });

    test("applies destructive variant classes when variant='destructive'", () => {
        render(<Button variant="destructive">Delete</Button>);
        const btn = screen.getByText("Delete");

        expect(btn.tagName).toBe("BUTTON");
        expect(btn.getAttribute("data-slot")).toBe("button");

        expect(btn.className).toContain("bg-destructive");
        expect(btn.className).toContain("hover:bg-destructive/90");
        expect(btn.className).toContain("focus-visible:ring-destructive/20");

        expect(btn.className).not.toContain("bg-primary");
    });

    test("applies size classes when size='lg'", () => {
        render(<Button size="lg">Large</Button>);
        const btn = screen.getByText("Large");

        expect(btn.tagName).toBe("BUTTON");
        expect(btn.getAttribute("data-slot")).toBe("button");

        expect(btn.className).toContain("h-10");
        expect(btn.className).toContain("px-6");
        expect(btn.className).toContain("has-[>svg]:px-4");

        expect(btn.className).not.toContain("h-8"); // sm
        expect(btn.className).not.toContain("h-9"); // default
    });

    test("merges additional className prop", () => {
        render(<Button className="extra-class another">Custom</Button>);
        const btn = screen.getByText("Custom");

        expect(btn.tagName).toBe("BUTTON");
        expect(btn.getAttribute("data-slot")).toBe("button");

        expect(btn.className).toContain("extra-class");
        expect(btn.className).toContain("another");

        expect(btn.className).toContain("bg-primary");
        expect(btn.className).toContain("h-9");
    });

    test("renders as child element when asChild=true", () => {
        render(
            <Button asChild>
                <a href="/test">LinkBtn</a>
            </Button>
        );
        const link = screen.getByRole("link", { name: "LinkBtn" });

        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/test");
        expect(link.getAttribute("data-slot")).toBe("button");

        expect(link.className).toContain("bg-primary");
        expect(link.className).toContain("h-9");
    });

    test("renders children properly when asChild with custom className", () => {
        render(
            <Button asChild className="extra">
                <span>SpanBtn</span>
            </Button>
        );
        const span = screen.getByText("SpanBtn");

        expect(span.tagName).toBe("SPAN");
        expect(span.getAttribute("data-slot")).toBe("button");

        expect(span.className).toContain("extra");
        expect(span.className).toContain("bg-primary");
        expect(span.className).toContain("h-9");
    });
});