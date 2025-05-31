import { describe, test, expect, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";
import { GET as statsHandler } from "@/app/api/admin/stats/route";
import { OrderService, Order } from "@/lib/services/order-service";
import { DiscountService, DiscountCode } from "@/lib/services/discount-service";

describe("GET /api/admin/stats", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test("returns aggregated statistics correctly (200)", async () => {
        const orders: Order[] = [
            {
                id: "ORD-0001",
                items: [
                    { productId: "p1", quantity: 2, product: { id: "p1", name: "A", price: 10, description: "" } },
                    { productId: "p2", quantity: 1, product: { id: "p2", name: "B", price: 20, description: "" } },
                ],
                subtotal: 40,
                discountCode: "SAVE5",
                discountAmount: 5,
                finalAmount: 35,
                createdAt: "2025-01-01T00:00:00.000Z",
            },
            {
                id: "ORD-0002",
                items: [
                    { productId: "p3", quantity: 3, product: { id: "p3", name: "C", price: 5, description: "" } },
                ],
                subtotal: 15,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 15,
                createdAt: "2025-02-01T00:00:00.000Z",
            },
        ];
        vi.spyOn(OrderService, "getAllOrders").mockReturnValue(orders);

        const discountCodes: DiscountCode[] = [
            { code: "SAVE5", isUsed: true, createdAt: "2025-01-01T00:00:00.000Z", usedAt: "2025-01-02T00:00:00.000Z" },
            { code: "WELCOME10", isUsed: false, createdAt: "2025-03-01T00:00:00.000Z" },
        ];
        vi.spyOn(DiscountService, "getAllDiscountCodes").mockReturnValue(discountCodes);

        vi.spyOn(DiscountService, "getNextDiscountOrderNumber").mockReturnValue(5);

        const res = await statsHandler();
        expect(res).toBeInstanceOf(NextResponse);
        expect(res.status).toBe(200);

        const body = await res.json();
        // totalItemsPurchased = 2 + 1 + 3 = 6
        expect(body.totalItemsPurchased).toBe(6);
        // totalPurchaseAmount = 35 + 15 = 50
        expect(body.totalPurchaseAmount).toBe(50);
        // totalDiscountAmount = 5 + 0 = 5
        expect(body.totalDiscountAmount).toBe(5);
        // totalOrders = 2
        expect(body.totalOrders).toBe(2);

        // Verify discountCodes array in response
        expect(body.discountCodes).toEqual([
            { code: "SAVE5", isUsed: true, createdAt: "2025-01-01T00:00:00.000Z", usedAt: "2025-01-02T00:00:00.000Z" },
            { code: "WELCOME10", isUsed: false, createdAt: "2025-03-01T00:00:00.000Z", usedAt: undefined },
        ]);

        // Verify nextDiscountOrderNumber
        expect(body.nextDiscountOrderNumber).toBe(5);
    });

    test("returns 500 if an error is thrown", async () => {
        vi.spyOn(OrderService, "getAllOrders").mockImplementation(() => {
            throw new Error("Database down");
        });

        const res = await statsHandler();
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ message: "Failed to get admin statistics" });
    });
});