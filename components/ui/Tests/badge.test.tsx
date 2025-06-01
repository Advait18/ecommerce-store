import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { Badge, badgeVariants } from "../badge";

describe("<Badge />", () => {
  test("renders as a <span> by default with default variant classes", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");

    expect(badge.tagName).toBe("SPAN");

    expect(badge.getAttribute("data-slot")).toBe("badge");

    const defaultClasses = badgeVariants({ variant: "default" }).split(" ");
    defaultClasses.forEach((cls: any) => {
      expect(badge.className).toContain(cls);
    });
  });

  test("applies secondary variant classes when variant='secondary'", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");

    expect(badge.tagName).toBe("SPAN");

    expect(badge.getAttribute("data-slot")).toBe("badge");

    const secondaryClasses = badgeVariants({ variant: "secondary" }).split(" ");
    secondaryClasses.forEach((cls) => {
      expect(badge.className).toContain(cls);
    });
  });

  test("merges additional className prop", () => {
    render(<Badge className="extra-class another">CustomClass</Badge>);
    const badge = screen.getByText("CustomClass");

    expect(badge.tagName).toBe("SPAN");
    expect(badge.getAttribute("data-slot")).toBe("badge");

    expect(badge.className).toContain("extra-class");
    expect(badge.className).toContain("another");

    expect(badge.className).toContain("bg-primary");
  });

  test("renders as child element when asChild=true", () => {
    render(
      <Badge asChild>
        <button>ClickMe</button>
      </Badge>
    );
    const button = screen.getByRole("button", { name: "ClickMe" });

    expect(button.tagName).toBe("BUTTON");

    expect(button.getAttribute("data-slot")).toBe("badge");

    const defaultClasses = badgeVariants({ variant: "default" }).split(" ");
    defaultClasses.forEach((cls) => {
      expect(button.className).toContain(cls);
    });
  });

  test("renders children properly when asChild with custom className", () => {
    render(
      <Badge asChild className="extra">
        <a href="/test">LinkBadge</a>
      </Badge>
    );
    const link = screen.getByRole("link", { name: "LinkBadge" });

    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/test");
    expect(link.getAttribute("data-slot")).toBe("badge");

    expect(link.className).toContain("extra");
    expect(link.className).toContain("bg-primary");
  });
});