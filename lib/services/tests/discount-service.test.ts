import { describe, test, expect, beforeEach } from "vitest";
import type { CartItem } from "../cart-service";
import { OrderService } from "../order-service";
import { DiscountService } from "../discount-service";

describe("DiscountService", () => {
    const DISCOUNT_ORDER_INTERVAL = 3
    const DISCOUNT_PERCENTAGE = 10

    beforeEach(() => {
        // Clear any existing orders so getTotalOrderCount() returns 0
        OrderService.clearOrdersForTest();
        // Clear any existing discount codes
        DiscountService.clearDiscountsForTest();
    });

    describe("shouldGenerateDiscount()", () => {
        test("returns false when there are no orders", () => {
            expect(OrderService.getTotalOrderCount()).toBe(0);
            expect(DiscountService.shouldGenerateDiscount()).toBe(false);
        });

        test("returns false when order count is not a multiple of 3", () => {
            for (let i = 0; i < DISCOUNT_ORDER_INTERVAL - 1; i++) {
                OrderService.createOrder({
                    items: [] as CartItem[],
                    subtotal: 0,
                    discountCode: null,
                    discountAmount: 0,
                    finalAmount: 0,
                });
            }
            const count = OrderService.getTotalOrderCount();
            expect(count).toBe(DISCOUNT_ORDER_INTERVAL - 1);
            expect(DiscountService.shouldGenerateDiscount()).toBe(false);
        });

        test("returns true when order count is exactly 3", () => {
            for (let i = 0; i < DISCOUNT_ORDER_INTERVAL; i++) {
                OrderService.createOrder({
                    items: [] as CartItem[],
                    subtotal: 0,
                    discountCode: null,
                    discountAmount: 0,
                    finalAmount: 0,
                });
            }
            expect(OrderService.getTotalOrderCount()).toBe(DISCOUNT_ORDER_INTERVAL);
            expect(DiscountService.shouldGenerateDiscount()).toBe(true);
        });

        test("returns false again until the next multiple of 3", () => {
            for (let i = 0; i < DISCOUNT_ORDER_INTERVAL + 1; i++) {
                OrderService.createOrder({
                    items: [] as CartItem[],
                    subtotal: 0,
                    discountCode: null,
                    discountAmount: 0,
                    finalAmount: 0,
                });
            }
            expect(OrderService.getTotalOrderCount()).toBe(DISCOUNT_ORDER_INTERVAL + 1);
            expect(DiscountService.shouldGenerateDiscount()).toBe(false);
        });
    });

    describe("generateDiscount()", () => {
        test("creates a new discount code and stores it", () => {
            const code = DiscountService.generateDiscount();
            expect(typeof code).toBe("string");

            // Newly created code should appear in getAllDiscountCodes()
            const allCodes = DiscountService.getAllDiscountCodes();
            expect(allCodes).toHaveLength(1);
            expect(allCodes[0].code).toBe(code);
            expect(allCodes[0].isUsed).toBe(false);
            expect(typeof allCodes[0].createdAt).toBe("string");
        });

        test("subsequent generateDiscount() calls produce different codes", () => {
            const c1 = DiscountService.generateDiscount();
            const c2 = DiscountService.generateDiscount();
            expect(c1).not.toBe(c2);
            expect(DiscountService.getAllDiscountCodes()).toHaveLength(2);
        });
    });

    describe("validateDiscount()", () => {
        test("invalid code returns isValid=false with proper message", () => {
            const result = DiscountService.validateDiscount("NOTACODE", 100);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe("Invalid discount code");
            expect(result.discountAmount).toBeUndefined();
        });

        test("valid, unused code returns isValid=true and correct discountAmount", () => {
            const code = DiscountService.generateDiscount();
            const cartTotal = 200;
            const expectedAmt = (cartTotal * DISCOUNT_PERCENTAGE) / 100;
            const result = DiscountService.validateDiscount(code, cartTotal);
            expect(result.isValid).toBe(true);
            expect(result.discountAmount).toBeCloseTo(expectedAmt, 2);
            expect(result.message).toBeUndefined();
        });

        test("already used code returns isValid=false with proper message", () => {
            const code = DiscountService.generateDiscount();

            // Mark code as used
            expect(DiscountService.useDiscount(code)).toBe(true);
            const result = DiscountService.validateDiscount(code, 150);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe("Discount code has already been used");
            expect(result.discountAmount).toBeUndefined();
        });
    });

    describe("useDiscount()", () => {
        test("marks a valid unused code as used and returns true", () => {
            const code = DiscountService.generateDiscount();
            expect(DiscountService.useDiscount(code)).toBe(true);

            const all = DiscountService.getAllDiscountCodes();
            const used = DiscountService.getUsedDiscountCodes();
            const avail = DiscountService.getAvailableDiscountCodes();

            // The code should no longer appear among available codes
            expect(avail.find((d) => d.code === code)).toBeUndefined();
            // It should now appear among used codes
            expect(used.find((d) => d.code === code)).toBeDefined();
            // The used entry should have a usedAt timestamp
            expect(typeof used.find((d) => d.code === code)?.usedAt).toBe("string");
        });

        test("calling useDiscount() again on the same code returns false", () => {
            const code = DiscountService.generateDiscount();
            expect(DiscountService.useDiscount(code)).toBe(true);
            expect(DiscountService.useDiscount(code)).toBe(false);
        });

        test("using a non-existent code returns false", () => {
            expect(DiscountService.useDiscount("RANDOM123")).toBe(false);
        });
    });

    describe("getAllDiscountCodes(), getAvailableDiscountCodes(), getUsedDiscountCodes()", () => {
        test("correctly separates used vs. unused codes", () => {
            const c1 = DiscountService.generateDiscount();
            const c2 = DiscountService.generateDiscount();
            expect(DiscountService.getAllDiscountCodes()).toHaveLength(2);
            expect(DiscountService.getAvailableDiscountCodes()).toHaveLength(2);
            expect(DiscountService.getUsedDiscountCodes()).toHaveLength(0);

            // Use one code
            expect(DiscountService.useDiscount(c1)).toBe(true);

            const all = DiscountService.getAllDiscountCodes();
            const avail = DiscountService.getAvailableDiscountCodes();
            const used = DiscountService.getUsedDiscountCodes();

            expect(all.map((d) => d.code).sort()).toEqual([c1, c2].sort());
            expect(avail.map((d) => d.code)).toEqual([c2]);
            expect(used.map((d) => d.code)).toEqual([c1]);
        });
    });

    describe("getNextDiscountOrderNumber()", () => {
        test("when order count is 0, next discount order is 3", () => {
            expect(DiscountService.getNextDiscountOrderNumber()).toBe(DISCOUNT_ORDER_INTERVAL);
        });

        test("when order count is partial, it returns total + (interval - remainder)", () => {
            const partial = 3;
            for (let i = 0; i < partial; i++) {
                OrderService.createOrder({
                    items: [] as CartItem[],
                    subtotal: 0,
                    discountCode: null,
                    discountAmount: 0,
                    finalAmount: 0,
                });
            }
            const remainder = partial % DISCOUNT_ORDER_INTERVAL;
            const expected = partial + (DISCOUNT_ORDER_INTERVAL - remainder);
            expect(DiscountService.getNextDiscountOrderNumber()).toBe(expected);
        });

        test("when order count is exactly 3, next is twice the interval", () => {
            for (let i = 0; i < DISCOUNT_ORDER_INTERVAL; i++) {
                OrderService.createOrder({
                    items: [] as CartItem[],
                    subtotal: 0,
                    discountCode: null,
                    discountAmount: 0,
                    finalAmount: 0,
                });
            }
            expect(DiscountService.getNextDiscountOrderNumber()).toBe(DISCOUNT_ORDER_INTERVAL * 2);
        });
    });

    describe("orderQualifiesForDiscount()", () => {
        test("returns false for non-positive order numbers", () => {
            expect(DiscountService.orderQualifiesForDiscount(0)).toBe(false);
            expect(DiscountService.orderQualifiesForDiscount(-5)).toBe(false);
        });

        test("returns true only when orderNumber % 3 === 0", () => {
            expect(DiscountService.orderQualifiesForDiscount(DISCOUNT_ORDER_INTERVAL * 2)).toBe(true);
            expect(DiscountService.orderQualifiesForDiscount(DISCOUNT_ORDER_INTERVAL * 2 + 1)).toBe(false);
        });
    });
});
