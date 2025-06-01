import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { Input } from "../input";

describe("<Input />", () => {
    test("renders an <input> with data-slot='input' and default classes", () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText("Enter text") as HTMLInputElement;

        expect(input.tagName).toBe("INPUT");

        expect(input.getAttribute("data-slot")).toBe("input");

        expect(input.className).toContain("border-input");
        expect(input.className).toContain("rounded-md");
        expect(input.className).toContain("focus-visible:ring-ring/50");
        expect(input.className).toContain("aria-invalid:ring-destructive/20");
    });

    test("honors the type prop (e.g., type='password')", () => {
        render(<Input type="password" placeholder="Password" />);
        const input = screen.getByPlaceholderText("Password") as HTMLInputElement;
        expect(input.getAttribute("type")).toBe("password");
    });

    test("merges additional className prop", () => {
        render(
            <Input
                className="extra-class another"
                placeholder="Custom"
            />
        );
        const input = screen.getByPlaceholderText("Custom") as HTMLInputElement;

        expect(input.className).toContain("extra-class");
        expect(input.className).toContain("another");

        expect(input.className).toContain("px-3");
    });

    test("accepts and displays value when provided", () => {
        render(<Input value="Hello" onChange={() => { }} />);
        const input = screen.getByDisplayValue("Hello") as HTMLInputElement;
        expect(input.value).toBe("Hello");
    });

    test("renders disabled input when disabled prop is set", () => {
        render(<Input disabled placeholder="Disabled" />);
        const input = screen.getByPlaceholderText("Disabled") as HTMLInputElement;

        expect(input.disabled).toBe(true);

        expect(input.className).toContain("disabled:opacity-50");
    });

    test("reflects aria-invalid attribute when provided", () => {
        render(<Input aria-invalid="true" placeholder="Error" />);
        const input = screen.getByPlaceholderText("Error") as HTMLInputElement;

        expect(input.getAttribute("aria-invalid")).toBe("true");

        expect(input.className).toContain("aria-invalid:ring-destructive/20");
    });
});