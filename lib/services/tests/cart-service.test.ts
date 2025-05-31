import { describe, test, expect, beforeEach } from "vitest";
import { CartService, type Cart, type CartItem } from "../cart-service";
import { Product } from "../product-service";

describe('Cart Service', () => {

    const PRODUCTS: Product[] = [
        { id: "1", name: "Wireless Headphones", price: 99.99, description: "High-quality wireless headphones" },
        { id: "2", name: "Smart Watch", price: 199.99, description: "Feature-rich smartwatch" },
        { id: "3", name: "Laptop Stand", price: 49.99, description: "Ergonomic laptop stand" },
        { id: "4", name: "USB-C Cable", price: 19.99, description: "Fast charging USB-C cable" },
        { id: "5", name: "Bluetooth Speaker", price: 79.99, description: "Portable bluetooth speaker" },
        { id: "6", name: "Phone Case", price: 29.99, description: "Protective phone case" },
    ]

    beforeEach(() => {
        CartService.clearCart();
    });


    describe("addToCart()", () => {

        test("adds a new product when it is not yet in the cart", () => {
            const product = PRODUCTS[0]; // price: 99.99

            // Call the service:
            const cart = CartService.addToCart(product.id, 1);

            // Expect one line item:
            expect(cart.items).toHaveLength(1);
            expect(cart.items[0]).toStrictEqual({
                productId: product.id,
                quantity: 1,
                product,
            });

            // Check total = price * quantity
            expect(cart.total).toBeCloseTo(product.price * 1, 2);
        });

        test("increments quantity when the same product is added twice", () => {
            const product = PRODUCTS[0]; // price: 99.99

            CartService.addToCart(product.id, 1);
            CartService.addToCart(product.id, 1);

            const cart = CartService.getCart();

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].productId).toBe(product.id);
            expect(cart.items[0].quantity).toBe(2);

            // Total = 2 × 99.99
            expect(cart.total).toBeCloseTo(product.price * 2, 2);
        });

        test("throws an error when the product ID does not exist", () => {
            const invalidIds = ["0", "-1", "999"];
            invalidIds.forEach((badId) => {
                expect(() => CartService.addToCart(badId, 1))
                    .toThrowError("Product not found");
            });
        });

        test("correctly recalculates total after adding different products", () => {
            const prodA = PRODUCTS[0]; // price = 99.99
            const prodB = PRODUCTS[1]; // price = 199.99

            CartService.addToCart(prodA.id, 3);
            CartService.addToCart(prodB.id, 2);

            const cart = CartService.getCart();

            const expectedTotal = prodA.price * 3 + prodB.price * 2;

            expect(cart.items).toHaveLength(2);

            expect(cart.items.find((i) => i.productId === prodA.id)?.quantity).toBe(3);
            expect(cart.items.find((i) => i.productId === prodB.id)?.quantity).toBe(2);
            expect(cart.total).toBeCloseTo(expectedTotal, 2);
        });
    });

    describe('getCart()', () => {
        let emptyCart: Cart = {
            items: [],
            total: 0,
        }

        test("should return the items that are currently in the cart", () => {
            const product = PRODUCTS[0]; //price = 99.99
            expect(CartService.getCart()).toStrictEqual(emptyCart);
            CartService.addToCart(product.id, 1);
            expect(CartService.getCart()).toStrictEqual({ items: [{ productId: product.id, quantity: 1, product: product }], total: 99.99 });
        });
    });

    describe('updateCartItem()', () => {
        test("updates the quantity of an existing item and recalculates total", () => {
            CartService.addToCart(PRODUCTS[0].id, 1);// price = 99.99

            const updatedCart = CartService.updateCartItem(PRODUCTS[0].id, 3);

            expect(updatedCart.items).toHaveLength(1);
            expect(updatedCart.items[0].productId).toBe(PRODUCTS[0].id);
            expect(updatedCart.items[0].quantity).toBe(3);

            const expectedTotal = PRODUCTS[0].price * 3;
            expect(updatedCart.total).toBeCloseTo(expectedTotal, 2);
        });

        test("removes the item when updated quantity is 0 or negative", () => {
            CartService.addToCart(PRODUCTS[0].id, 2); // price = 99.99 * 2

            const updatedCart = CartService.updateCartItem(PRODUCTS[0].id, 0);

            expect(updatedCart.items).toHaveLength(0);
            expect(updatedCart.total).toBe(0);
        });

        test("does nothing if the product is not already in the cart", () => {
            const beforeCart = CartService.getCart();
            const resultCart = CartService.updateCartItem("nonexistent-id", 5);

            expect(resultCart.items).toStrictEqual(beforeCart.items);
            expect(resultCart.total).toBe(beforeCart.total);
        });
    });

    describe("removeFromCart()", () => {
        test("removes an existing item and updates total", () => {
            CartService.addToCart(PRODUCTS[0].id, 2); // 2 × 99.99
            CartService.addToCart(PRODUCTS[1].id, 1); // 1 × 199.99

            const updatedCart = CartService.removeFromCart(PRODUCTS[0].id);

            expect(updatedCart.items).toHaveLength(1);
            expect(updatedCart.items[0].productId).toBe(PRODUCTS[1].id);
            expect(updatedCart.items[0].quantity).toBe(1);

            const expectedTotal = PRODUCTS[1].price * 1;
            expect(updatedCart.total).toBeCloseTo(expectedTotal, 2);
        });

        test("removing a non-existent product does nothing", () => {
            expect(CartService.getCart().items).toHaveLength(0);

            const unchangedCart = CartService.removeFromCart("999");
            expect(unchangedCart.items).toHaveLength(0);
            expect(unchangedCart.total).toBe(0);

            CartService.addToCart(PRODUCTS[2].id, 3); // 3 × 49.99
            const cartBefore = CartService.getCart();
            const resultCart = CartService.removeFromCart("nonexistent-id");

            expect(resultCart.items).toStrictEqual(cartBefore.items);
            expect(resultCart.total).toBeCloseTo(cartBefore.total, 2);
        });
    });

    describe("clearCart()", () => {
        test("empties the cart and resets total to zero", () => {
            CartService.addToCart(PRODUCTS[0].id, 1);
            CartService.addToCart(PRODUCTS[1].id, 2);

            expect(CartService.getCart().items.length).toBeGreaterThan(0);
            expect(CartService.getCart().total).toBeGreaterThan(0);

            const clearedCart = CartService.clearCart();

            expect(clearedCart.items).toHaveLength(0);
            expect(clearedCart.total).toBe(0);
        });
    });

    describe("getItemCount()", () => {
        test("returns 0 for an empty cart", () => {
            expect(CartService.getItemCount()).toBe(0);
        });

        test("returns the sum of quantities for multiple items", () => {
            CartService.addToCart(PRODUCTS[0].id, 1);
            CartService.addToCart(PRODUCTS[1].id, 3);
            CartService.addToCart(PRODUCTS[2].id, 2);

            // Quantities: 1 + 3 + 2 = 6
            expect(CartService.getItemCount()).toBe(6);

            CartService.updateCartItem(PRODUCTS[1].id, 5);
            // New quantities: 1 + 5 + 2 = 8
            expect(CartService.getItemCount()).toBe(8);
        });
    });
});

