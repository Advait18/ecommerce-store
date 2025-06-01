import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { Label } from "../label";

describe("<Label />", () => {
    test("renders a <label> with data-slot='label' and default classes", () => {
        render(<Label>Username</Label>);
        const label = screen.getByText("Username");

        expect(label.tagName).toBe("LABEL");

        expect(label.getAttribute("data-slot")).toBe("label");

        expect(label.className).toContain("flex");
        expect(label.className).toContain("items-center");
        expect(label.className).toContain("text-sm");
        expect(label.className).toContain("select-none");
    });

    test("merges additional className prop", () => {
        render(
            <Label className="custom-class another">Email Address</Label>
        );
        const label = screen.getByText("Email Address");

        expect(label.tagName).toBe("LABEL");

        expect(label.getAttribute("data-slot")).toBe("label");

        expect(label.className).toContain("custom-class");
        expect(label.className).toContain("another");

        expect(label.className).toContain("gap-2");
    });

    test("forwards htmlFor prop to the underlying <label>", () => {
        render(<Label htmlFor="username-input">Username</Label>);

        const allLabels = screen.getAllByText("Username");
        const matched = allLabels.find(
            (node) => node.getAttribute("for") === "username-input"
        );
        expect(matched).toBeDefined();
        expect(matched!.getAttribute("for")).toBe("username-input");
    });

    test("renders correctly when disabled attribute is passed via props", () => {
        render(
            <Label data-disabled="true" className="extra">
                Disabled Label
            </Label>
        );
        const label = screen.getByText("Disabled Label");

        expect(label.getAttribute("data-slot")).toBe("label");

        expect(label.className).toContain("extra");
        expect(label.className).toContain("opacity-50");
    });
});