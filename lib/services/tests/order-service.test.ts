import { describe, test, expect, beforeEach } from "vitest";
import { OrderService } from "../order-service";
import { CartItem } from "../cart-service";

describe("OrderService", () => {
    const sampleItemsA: CartItem[] = [
        {
            productId: "p1",
            quantity: 2,
            product: { id: "p1", name: "Widget", price: 10, description: "" },
        },
        {
            productId: "p2",
            quantity: 1,
            product: { id: "p2", name: "Gadget", price: 20, description: "" },
        },
    ];

    const sampleItemsB: CartItem[] = [
        {
            productId: "p3",
            quantity: 5,
            product: { id: "p3", name: "Thingamajig", price: 5, description: "" },
        },
    ];

    beforeEach(() => {
        OrderService.clearOrdersForTest();
    });

    describe("createOrder()", () => {
        test("generates a properly formatted ID and stores the new order", () => {
            const orderData = {
                items: sampleItemsA,
                subtotal: 40, // 2*10 + 1*20 = 40
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            };

            const newOrder = OrderService.createOrder(orderData);

            // The first ID must be "ORD-0001"
            expect(newOrder.id).toBe("ORD-0001");

            // The returned items should match sampleItemsA exactly
            expect(newOrder.items).toEqual(sampleItemsA);

            // Check financial fields
            expect(newOrder.subtotal).toBe(40);
            expect(newOrder.discountCode).toBeNull();
            expect(newOrder.discountAmount).toBe(0);
            expect(newOrder.finalAmount).toBe(40);

            // createdAt should be a valid ISO string
            expect(typeof newOrder.createdAt).toBe("string");
            expect(() => new Date(newOrder.createdAt)).not.toThrow();

            // Confirm the order is added to internal list
            expect(OrderService.getTotalOrderCount()).toBe(1);
        });

        test("increments ID counter for subsequent orders", () => {
            OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });

            const secondOrder = OrderService.createOrder({
                items: sampleItemsB,
                subtotal: 25, // 5 * 5 = 25
                discountCode: "SAVE5",
                discountAmount: 5,
                finalAmount: 20,
            });

            // Second ID must be "ORD-0002"
            expect(secondOrder.id).toBe("ORD-0002");
            expect(OrderService.getTotalOrderCount()).toBe(2);
        });
    });

    describe("getAllOrders()", () => {
        test("returns an empty array when no orders exist", () => {
            expect(OrderService.getAllOrders()).toEqual([]);
        });

        test("returns all created orders in insertion order", () => {
            const o1 = OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });
            const o2 = OrderService.createOrder({
                items: sampleItemsB,
                subtotal: 25,
                discountCode: "SAVE5",
                discountAmount: 5,
                finalAmount: 20,
            });

            const all = OrderService.getAllOrders();
            expect(all).toHaveLength(2);
            expect(all[0].id).toBe(o1.id);
            expect(all[1].id).toBe(o2.id);
        });
    });

    describe("getOrder()", () => {
        test("returns null if the order ID does not exist", () => {
            expect(OrderService.getOrder("ORD-9999")).toBeNull();
        });

        test("returns the correct order by ID when found", () => {
            const o1 = OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });
            const result = OrderService.getOrder(o1.id);
            expect(result).not.toBeNull();
            expect(result?.id).toBe(o1.id);
            expect(result?.subtotal).toBe(40);
        });
    });

    describe("getTotalOrderCount()", () => {
        test("returns 0 when no orders exist", () => {
            expect(OrderService.getTotalOrderCount()).toBe(0);
        });

        test("returns the correct count after multiple orders", () => {
            OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });
            OrderService.createOrder({
                items: sampleItemsB,
                subtotal: 25,
                discountCode: "SAVE5",
                discountAmount: 5,
                finalAmount: 20,
            });
            expect(OrderService.getTotalOrderCount()).toBe(2);
        });
    });

    describe("getOrdersWithDiscounts()", () => {
        test("returns an empty array when no orders have discount", () => {
            OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });
            expect(OrderService.getOrdersWithDiscounts()).toEqual([]);
        });

        test("returns only orders that have a non-null discountCode", () => {
            const o1 = OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });
            const o2 = OrderService.createOrder({
                items: sampleItemsB,
                subtotal: 25,
                discountCode: "SAVE5",
                discountAmount: 5,
                finalAmount: 20,
            });
            const o3 = OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: "WELCOME10",
                discountAmount: 10,
                finalAmount: 30,
            });

            const discounted = OrderService.getOrdersWithDiscounts();
            expect(discounted).toHaveLength(2);
            expect(discounted.map((o) => o.id)).toEqual([o2.id, o3.id]);
        });
    });

    describe("getTotalRevenue()", () => {
        test("returns 0 when no orders exist", () => {
            expect(OrderService.getTotalRevenue()).toBe(0);
        });

        test("sums finalAmount of all orders correctly", () => {
            OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });
            OrderService.createOrder({
                items: sampleItemsB,
                subtotal: 25,
                discountCode: "SAVE5",
                discountAmount: 5,
                finalAmount: 20,
            });
            // Revenue = 40 + 20 = 60
            expect(OrderService.getTotalRevenue()).toBe(60);
        });
    });

    describe("getTotalDiscountAmount()", () => {
        test("returns 0 when no orders exist", () => {
            expect(OrderService.getTotalDiscountAmount()).toBe(0);
        });

        test("sums discountAmount of all orders correctly", () => {
            OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: null,
                discountAmount: 0,
                finalAmount: 40,
            });
            OrderService.createOrder({
                items: sampleItemsB,
                subtotal: 25,
                discountCode: "SAVE5",
                discountAmount: 5,
                finalAmount: 20,
            });
            OrderService.createOrder({
                items: sampleItemsA,
                subtotal: 40,
                discountCode: "WELCOME10",
                discountAmount: 10,
                finalAmount: 30,
            });
            // Total discount = 0 + 5 + 10 = 15
            expect(OrderService.getTotalDiscountAmount()).toBe(15);
        });
    });
});
