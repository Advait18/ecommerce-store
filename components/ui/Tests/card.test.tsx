import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
} from "../card";

describe("<Card /> family of components", () => {
    test("Card renders a <div> with data-slot='card' and default classes", () => {
        render(<Card>My Card</Card>);
        const card = screen.getByText("My Card");

        expect(card.tagName).toBe("DIV");

        expect(card.getAttribute("data-slot")).toBe("card");

        expect(card.className).toContain("bg-card");
        expect(card.className).toContain("text-card-foreground");
        expect(card.className).toContain("rounded-xl");
    });

    test("Card merges a custom className", () => {
        render(<Card className="custom-class">With Custom</Card>);
        const card = screen.getByText("With Custom");
        expect(card.getAttribute("data-slot")).toBe("card");
        expect(card.className).toContain("custom-class");

        expect(card.className).toContain("shadow-sm");
    });

    test("CardHeader renders with data-slot='card-header' and default classes", () => {
        render(<CardHeader>Header Content</CardHeader>);
        const header = screen.getByText("Header Content");
        expect(header.tagName).toBe("DIV");
        expect(header.getAttribute("data-slot")).toBe("card-header");
        expect(header.className).toContain("grid");
        expect(header.className).toContain("gap-1.5");
    });

    test("CardHeader merges custom className", () => {
        render(
            <CardHeader className="hdr-class">Header Custom</CardHeader>
        );
        const header = screen.getByText("Header Custom");
        expect(header.getAttribute("data-slot")).toBe("card-header");
        expect(header.className).toContain("hdr-class");
        expect(header.className).toContain("auto-rows-min");
    });

    test("CardTitle renders with data-slot='card-title' and default classes", () => {
        render(<CardTitle>Title Here</CardTitle>);
        const title = screen.getByText("Title Here");
        expect(title.tagName).toBe("DIV");
        expect(title.getAttribute("data-slot")).toBe("card-title");
        expect(title.className).toContain("font-semibold");
        expect(title.className).toContain("leading-none");
    });

    test("CardTitle merges custom className", () => {
        render(
            <CardTitle className="title-class">Title Custom</CardTitle>
        );
        const title = screen.getByText("Title Custom");
        expect(title.getAttribute("data-slot")).toBe("card-title");
        expect(title.className).toContain("title-class");
    });

    test("CardDescription renders with data-slot='card-description' and default classes", () => {
        render(<CardDescription>Desc Text</CardDescription>);
        const desc = screen.getByText("Desc Text");
        expect(desc.tagName).toBe("DIV");
        expect(desc.getAttribute("data-slot")).toBe("card-description");
        expect(desc.className).toContain("text-muted-foreground");
        expect(desc.className).toContain("text-sm");
    });

    test("CardDescription merges custom className", () => {
        render(
            <CardDescription className="desc-class">Desc Custom</CardDescription>
        );
        const desc = screen.getByText("Desc Custom");
        expect(desc.getAttribute("data-slot")).toBe("card-description");
        expect(desc.className).toContain("desc-class");
    });

    test("CardAction renders with data-slot='card-action' and default classes", () => {
        render(<CardAction>Action Here</CardAction>);
        const action = screen.getByText("Action Here");
        expect(action.tagName).toBe("DIV");
        expect(action.getAttribute("data-slot")).toBe("card-action");
        expect(action.className).toContain("justify-self-end");
        expect(action.className).toContain("row-span-2");
    });

    test("CardAction merges custom className", () => {
        render(
            <CardAction className="act-class">Action Custom</CardAction>
        );
        const action = screen.getByText("Action Custom");
        expect(action.getAttribute("data-slot")).toBe("card-action");
        expect(action.className).toContain("act-class");
    });

    test("CardContent renders with data-slot='card-content' and default classes", () => {
        render(<CardContent>Main Content</CardContent>);
        const content = screen.getByText("Main Content");
        expect(content.tagName).toBe("DIV");
        expect(content.getAttribute("data-slot")).toBe("card-content");
        expect(content.className).toContain("px-6");
    });

    test("CardContent merges custom className", () => {
        render(
            <CardContent className="cnt-class">Content Custom</CardContent>
        );
        const content = screen.getByText("Content Custom");
        expect(content.getAttribute("data-slot")).toBe("card-content");
        expect(content.className).toContain("cnt-class");
    });

    test("CardFooter renders with data-slot='card-footer' and default classes", () => {
        render(<CardFooter>Footer Here</CardFooter>);
        const footer = screen.getByText("Footer Here");
        expect(footer.tagName).toBe("DIV");
        expect(footer.getAttribute("data-slot")).toBe("card-footer");
        expect(footer.className).toContain("flex");
        expect(footer.className).toContain("items-center");

        expect(footer.className).toContain("px-6");
        expect(footer.className).toContain("[.border-t]:pt-6");
    });

    test("CardFooter merges custom className", () => {
        render(
            <CardFooter className="ftr-class">Footer Custom</CardFooter>
        );
        const footer = screen.getByText("Footer Custom");
        expect(footer.getAttribute("data-slot")).toBe("card-footer");
        expect(footer.className).toContain("ftr-class");

        expect(footer.className).toContain("px-6");
        expect(footer.className).toContain("[.border-t]:pt-6");
    });
});