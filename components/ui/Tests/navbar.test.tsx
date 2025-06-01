import React from "react";
import { render, within } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

vi.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => {
        return <a href={href}>{children}</a>;
    },
}));

import Navbar from "../navbar";

describe("<Navbar />", () => {
    test("renders brand link with correct text and href", () => {
        const { container } = render(<Navbar />);

        const nav = container.querySelector("nav");
        expect(nav).not.toBeNull();

        const brandLink = within(nav!).getByText("Ecommerce Store");

        expect(brandLink.tagName).toBe("A");
        expect(brandLink.getAttribute("href")).toBe("/");

        expect(nav!.className).toContain("border-b");
    });

    test("renders 'Store' link pointing to '/'", () => {
        const { container } = render(<Navbar />);
        const nav = container.querySelector("nav");

        const toolbar = within(nav!).getByText("Store").closest("div");
        expect(toolbar).not.toBeNull();

        const storeLink = within(toolbar!).getByText("Store");
        expect(storeLink.tagName).toBe("A");
        expect(storeLink.getAttribute("href")).toBe("/");
        expect(storeLink.textContent).toContain("Store");
    });

    test("renders 'Cart' link pointing to '/cart'", () => {
        const { container } = render(<Navbar />);
        const nav = container.querySelector("nav");

        const cartLink = within(nav!).getByText("Cart");
        expect(cartLink.tagName).toBe("A");
        expect(cartLink.getAttribute("href")).toBe("/cart");
        expect(cartLink.textContent).toContain("Cart");
    });

    test("renders 'Admin' link pointing to '/admin'", () => {
        const { container } = render(<Navbar />);
        const nav = container.querySelector("nav");
        const adminLink = within(nav!).getByText("Admin");
        expect(adminLink.tagName).toBe("A");
        expect(adminLink.getAttribute("href")).toBe("/admin");
        expect(adminLink.textContent).toContain("Admin");
    });

    test("all navigation links appear within the toolbar div", () => {
        const { container } = render(<Navbar />);
        const nav = container.querySelector("nav");

        const innerFlex = within(nav!).getByText("Ecommerce Store").closest("div")!.parentElement;

        const toolbarDiv = innerFlex!.querySelectorAll("div")[1];
        expect(toolbarDiv).not.toBeNull();


        const storeLink = within(toolbarDiv).getByText("Store");
        const cartLink = within(toolbarDiv).getByText("Cart");
        const adminLink = within(toolbarDiv).getByText("Admin");

        expect(storeLink.tagName).toBe("A");
        expect(cartLink.tagName).toBe("A");
        expect(adminLink.tagName).toBe("A");
    });
});