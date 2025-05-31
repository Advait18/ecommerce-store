import { describe, test, expect, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    GET as getCartHandler,
    POST as postCartHandler,
    PUT as putCartHandler,
    DELETE as deleteCartHandler,
} from "@/app/api/cart/route";

import { CartService } from "@/lib/services/cart-service";
import { ProductService } from "@/lib/services/product-service";

describe("/api/cart route handlers", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe("GET /api/cart", () => {
        test("returns the current cart as JSON (200)", async () => {
            // Mock CartService.getCart()
            const fakeCart = { items: [{ productId: "p1", quantity: 2, product: { id: "p1", name: "Test", price: 10, description: "" } }], total: 20 };
            vi.spyOn(CartService, "getCart").mockReturnValue(fakeCart as any);

            // Call handler
            const response = await getCartHandler();

            // Response status 200 and body matches fakeCart
            expect(response).toBeInstanceOf(NextResponse);
            const data = await response.json();
            expect(data).toEqual(fakeCart);
        });

        test("returns 500 with error message if CartService.getCart throws", async () => {
            vi.spyOn(CartService, "getCart").mockImplementation(() => {
                throw new Error("Something broke");
            });

            const response = await getCartHandler();
            expect(response).toBeInstanceOf(NextResponse);
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({ message: "Failed to get cart" });
        });
    });

    describe("POST /api/cart", () => {
        // Helper to build a NextRequest with JSON body
        function mockRequest(body: unknown): NextRequest {
            return new Request("http://localhost/api/cart", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(body),
            }) as NextRequest;
        }

        test("returns 400 if productId missing or quantity invalid", async () => {
            // Missing productId
            let req = mockRequest({ quantity: 1 });
            let res = await postCartHandler(req);
            expect(res.status).toBe(400);
            expect(await res.json()).toEqual({ message: "Invalid productId or quantity" });

            // quantity <= 0
            req = mockRequest({ productId: "p1", quantity: 0 });
            res = await postCartHandler(req);
            expect(res.status).toBe(400);
            expect(await res.json()).toEqual({ message: "Invalid productId or quantity" });

            // quantity missing
            req = mockRequest({ productId: "p1" });
            res = await postCartHandler(req);
            expect(res.status).toBe(400);
            expect(await res.json()).toEqual({ message: "Invalid productId or quantity" });
        });

        test("returns 404 if ProductService.getProduct returns null", async () => {
            const req = mockRequest({ productId: "nonexistent", quantity: 2 });
            vi.spyOn(ProductService, "getProduct").mockReturnValue(null as any);

            const res = await postCartHandler(req);
            expect(res.status).toBe(404);
            expect(await res.json()).toEqual({ message: "Product not found" });
        });

        test("calls CartService.addToCart and returns updated cart (200)", async () => {
            const req = mockRequest({ productId: "p1", quantity: 3 });
            const fakeProduct = { id: "p1", name: "Test", price: 10, description: "" };
            const fakeUpdatedCart = { items: [{ productId: "p1", quantity: 3, product: fakeProduct }], total: 30 };

            vi.spyOn(ProductService, "getProduct").mockReturnValue(fakeProduct as any);
            vi.spyOn(CartService, "addToCart").mockReturnValue(fakeUpdatedCart as any);

            const res = await postCartHandler(req);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(fakeUpdatedCart);
        });

        test("returns 500 if an unexpected error is thrown", async () => {
            const req = mockRequest({ productId: "p1", quantity: 1 });
            vi.spyOn(ProductService, "getProduct").mockImplementation(() => {
                throw new Error("DB down");
            });

            const res = await postCartHandler(req);
            expect(res.status).toBe(500);
            expect(await res.json()).toEqual({ message: "Failed to add item to cart" });
        });
    });

    describe("PUT /api/cart", () => {
        function mockRequest(body: unknown): NextRequest {
            return new Request("http://localhost/api/cart", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(body),
            }) as NextRequest;
        }

        test("returns 400 if productId missing or quantity < 0", async () => {
            let req = mockRequest({ quantity: 2 });
            let res = await putCartHandler(req);
            expect(res.status).toBe(400);
            expect(await res.json()).toEqual({ message: "Invalid productId or quantity" });

            req = mockRequest({ productId: "p1", quantity: -1 });
            res = await putCartHandler(req);
            expect(res.status).toBe(400);
            expect(await res.json()).toEqual({ message: "Invalid productId or quantity" });
        });

        test("updates the cart and returns updated cart (200)", async () => {
            const req = mockRequest({ productId: "p1", quantity: 5 });
            const fakeUpdatedCart = { items: [{ productId: "p1", quantity: 5, product: { id: "p1", name: "Test", price: 10, description: "" } }], total: 50 };

            vi.spyOn(CartService, "updateCartItem").mockReturnValue(fakeUpdatedCart as any);

            const res = await putCartHandler(req);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(fakeUpdatedCart);
        });

        test("returns 500 if CartService.updateCartItem throws", async () => {
            const req = mockRequest({ productId: "p1", quantity: 2 });
            vi.spyOn(CartService, "updateCartItem").mockImplementation(() => {
                throw new Error("some error");
            });

            const res = await putCartHandler(req);
            expect(res.status).toBe(500);
            expect(await res.json()).toEqual({ message: "Failed to update cart item" });
        });
    });

    describe("DELETE /api/cart", () => {
        function mockRequest(url: string): NextRequest {
            return new Request(url, {
                method: "DELETE",
            }) as NextRequest;
        }

        test("returns 400 if productId query param is missing", async () => {
            const req = mockRequest("http://localhost/api/cart");
            const res = await deleteCartHandler(req);
            expect(res.status).toBe(400);
            expect(await res.json()).toEqual({ message: "Product ID is required" });
        });

        test("calls CartService.removeFromCart and returns updated cart (200)", async () => {
            const fakeUpdatedCart = { items: [], total: 0 };
            vi.spyOn(CartService, "removeFromCart").mockReturnValue(fakeUpdatedCart as any);

            const req = mockRequest("http://localhost/api/cart?productId=p1");
            const res = await deleteCartHandler(req);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(fakeUpdatedCart);
        });

        test("returns 500 if CartService.removeFromCart throws", async () => {
            vi.spyOn(CartService, "removeFromCart").mockImplementation(() => {
                throw new Error("remove failed");
            });
            const req = mockRequest("http://localhost/api/cart?productId=p1");
            const res = await deleteCartHandler(req);
            expect(res.status).toBe(500);
            expect(await res.json()).toEqual({ message: "Failed to remove item from cart" });
        });
    });
});
