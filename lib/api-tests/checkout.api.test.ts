import { describe, test, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST as checkoutHandler } from "@/app/api/checkout/route";
import { CartService } from "@/lib/services/cart-service";
import { OrderService } from "@/lib/services/order-service";
import { DiscountService } from "@/lib/services/discount-service";

function makeJsonRequest(body: unknown): NextRequest {
    return new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    }) as NextRequest;
}

describe("POST /api/checkout", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(CartService, "getCart").mockReturnValue({
            items: [
                {
                    productId: "p1",
                    quantity: 1,
                    product: { id: "p1", name: "Test", price: 10, description: "" },
                },
            ],
            total: 10,
        } as any);

        vi.spyOn(DiscountService, "shouldGenerateDiscount").mockReturnValue(false);
        vi.spyOn(DiscountService, "validateDiscount").mockReturnValue({ isValid: true, discountAmount: 0 } as any);
        vi.spyOn(DiscountService, "useDiscount").mockReturnValue(true);
        vi.spyOn(DiscountService, "generateDiscount").mockReturnValue("NEWCODE");
        vi.spyOn(OrderService, "createOrder").mockReturnValue({
            id: "ORD-0001",
            items: [
                {
                    productId: "p1",
                    quantity: 1,
                    product: { id: "p1", name: "Test", price: 10, description: "" },
                },
            ],
            subtotal: 10,
            discountCode: null,
            discountAmount: 0,
            finalAmount: 10,
            createdAt: new Date().toISOString(),
        } as any);
        vi.spyOn(CartService, "clearCart").mockImplementation(() => {
            return { items: [], total: 0 } as any;
        });
    });

    test("returns 400 if cart is empty", async () => {
        // Override getCart() so that items = []:
        vi.spyOn(CartService, "getCart").mockReturnValue({ items: [], total: 0 } as any);

        const res = await checkoutHandler(makeJsonRequest({}));
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: "Cart is empty" });
    });

    test("returns 400 if provided discount code is invalid", async () => {
        vi
            .spyOn(DiscountService, "validateDiscount")
            .mockReturnValue({ isValid: false, message: "Bad code" } as any);

        const res = await checkoutHandler(makeJsonRequest({ discountCode: "BAD" }));
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: "Bad code" });
    });

    test("successful checkout without discount and no new code", async () => {
        // Default mocks mean cart has one item worth 10, no discount
        const res = await checkoutHandler(makeJsonRequest({}));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({
            orderId: "ORD-0001",
            finalAmount: 10,
            discountApplied: false,
            discountAmount: 0,
            newDiscountCode: null,
        });
        expect(CartService.clearCart).toHaveBeenCalled();
    });

    test("successful checkout with valid discount, no new code", async () => {
        vi.spyOn(DiscountService, "validateDiscount").mockReturnValue({ isValid: true, discountAmount: 2 } as any);
        vi.spyOn(CartService, "getCart").mockReturnValue({
            items: [
                {
                    productId: "p1",
                    quantity: 1,
                    product: { id: "p1", name: "Test", price: 10, description: "" },
                },
            ],
            total: 10,
        } as any);

        vi.spyOn(OrderService, "createOrder").mockReturnValue({
            id: "ORD-0002",
            items: [
                {
                    productId: "p1",
                    quantity: 1,
                    product: { id: "p1", name: "Test", price: 10, description: "" },
                },
            ],
            subtotal: 10,
            discountCode: "SAVE2",
            discountAmount: 2,
            finalAmount: 8,
            createdAt: new Date().toISOString(),
        } as any);

        const res = await checkoutHandler(makeJsonRequest({ discountCode: "SAVE2" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({
            orderId: "ORD-0002",
            finalAmount: 8,
            discountApplied: true,
            discountAmount: 2,
            newDiscountCode: null,
        });
        expect(DiscountService.useDiscount).toHaveBeenCalledWith("SAVE2");
        expect(CartService.clearCart).toHaveBeenCalled();
    });

    test("generates new discount code when eligible", async () => {
        // Make shouldGenerateDiscount() return true now
        vi.spyOn(DiscountService, "shouldGenerateDiscount").mockReturnValue(true);

        const res = await checkoutHandler(makeJsonRequest({}));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.newDiscountCode).toBe("NEWCODE");
        expect(DiscountService.generateDiscount).toHaveBeenCalled();
    });

    test("returns 500 if any service throws", async () => {
        vi.spyOn(CartService, "getCart").mockImplementation(() => {
            throw new Error("oops");
        });
        const res = await checkoutHandler(makeJsonRequest({}));
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ message: "Failed to process checkout" });
    });
});