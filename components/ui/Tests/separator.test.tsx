import React from "react";
import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { Separator } from "../separator";

describe("<Separator />", () => {
  test("renders a horizontal separator by default", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector('[data-slot="separator"]');
    expect(sep).not.toBeNull();

    const className = sep!.className;

    expect(className).toContain("data-[orientation=horizontal]:h-px");
    expect(className).toContain("data-[orientation=horizontal]:w-full");

    expect(className).toContain("bg-border");
  });

  test("renders a vertical separator when orientation='vertical'", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.querySelector('[data-slot="separator"]');
    expect(sep).not.toBeNull();

    const className = sep!.className;

    expect(className).toContain("data-[orientation=vertical]:h-full");
    expect(className).toContain("data-[orientation=vertical]:w-px");
    expect(className).toContain("bg-border");
  });

  test("merges custom className prop", () => {
    const { container } = render(
      <Separator className="custom-sep another-class" />
    );
    const sep = container.querySelector('[data-slot="separator"]');
    expect(sep).not.toBeNull();

    const className = sep!.className;
    expect(className).toContain("custom-sep");
    expect(className).toContain("another-class");

    expect(className).toContain("data-[orientation=horizontal]:h-px");
  });

  test("retains both orientation selectors in className regardless of chosen orientation", () => {

    let { container } = render(<Separator orientation="horizontal" />);
    let sep = container.querySelector('[data-slot="separator"]')!;
    let className = sep.className;

    expect(className).toContain("data-[orientation=horizontal]:h-px");
    expect(className).toContain("data-[orientation=vertical]:h-full");

    ({ container } = render(<Separator orientation="vertical" />));
    sep = container.querySelector('[data-slot="separator"]')!;
    className = sep.className;
    expect(className).toContain("data-[orientation=horizontal]:h-px");
    expect(className).toContain("data-[orientation=vertical]:h-full");
  });
});