import { describe, test, expect, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";
import { POST as generateDiscountHandler } from "@/app/api/admin/generate-discount/route";
import { DiscountService } from "@/lib/services/discount-service";

describe("POST /api/admin/generate-discount", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test("returns 200 with a newly generated discount code", async () => {
        // Mock DiscountService.generateDiscount() to return "TESTCODE"
        vi.spyOn(DiscountService, "generateDiscount").mockReturnValue("TESTCODE");

        // Call the handler 
        const res = await generateDiscountHandler();

        // Status defaults to 200, and JSON matches
        expect(res).toBeInstanceOf(NextResponse);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({
            code: "TESTCODE",
            message: "Discount code generated successfully",
        });
    });

    test("returns 500 if DiscountService.generateDiscount throws", async () => {
        // Mock generateDiscount() to throw an error
        vi.spyOn(DiscountService, "generateDiscount").mockImplementation(() => {
            throw new Error("Generation failed");
        });

        const res = await generateDiscountHandler();

        // Status is 500, and JSON error message matches
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toEqual({ message: "Failed to generate discount code" });
    });
});