import { describe, test, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { POST as validateHandler } from "@/app/api/discount/validate/route";
import { DiscountService } from "@/lib/services/discount-service";

function makeJsonRequest(body: unknown): NextRequest {
    return new Request("http://localhost/api/discount/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    }) as NextRequest;
}

describe("POST /api/discount/validate", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test("returns 400 if code is missing", async () => {
        const req = makeJsonRequest({ cartTotal: 50 });
        const res = await validateHandler(req);
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: "Invalid discount code or cart total" });
    });

    test("returns 400 if cartTotal is undefined", async () => {
        const req = makeJsonRequest({ code: "SAVE10" });
        const res = await validateHandler(req);
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: "Invalid discount code or cart total" });
    });

    test("returns 400 if cartTotal is negative", async () => {
        const req = makeJsonRequest({ code: "SAVE10", cartTotal: -5 });
        const res = await validateHandler(req);
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: "Invalid discount code or cart total" });
    });

    test("returns 400 if DiscountService.validateDiscount returns isValid=false", async () => {
        vi.spyOn(DiscountService, "validateDiscount").mockReturnValue({
            isValid: false,
            message: "Invalid or expired code",
        });
        const req = makeJsonRequest({ code: "FAKECODE", cartTotal: 100 });
        const res = await validateHandler(req);
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: "Invalid or expired code" });
    });

    test("returns 200 with code, amount, and percentage when valid", async () => {
        const fakeAmount = 15;
        const fakePercentage = DiscountService.DISCOUNT_PERCENTAGE;
        vi.spyOn(DiscountService, "validateDiscount").mockReturnValue({
            isValid: true,
            discountAmount: fakeAmount,
        });
        const req = makeJsonRequest({ code: "SAVE15", cartTotal: 150 });
        const res = await validateHandler(req);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
            code: "SAVE15",
            amount: fakeAmount,
            percentage: fakePercentage,
        });
    });

    test("returns 500 with generic error if exception is thrown", async () => {
        vi.spyOn(DiscountService, "validateDiscount").mockImplementation(() => {
            throw new Error("Unexpected");
        });
        const req = makeJsonRequest({ code: "SAVE20", cartTotal: 200 });
        const res = await validateHandler(req);
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ message: "Failed to validate discount code" });
    });
});