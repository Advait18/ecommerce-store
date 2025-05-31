import { describe, test, expect } from "vitest";
import { ProductService, type Product } from "../product-service";

describe('Product Service', () => {
    const PRODUCTS: Product[] = [
        { id: "1", name: "Wireless Headphones", price: 99.99, description: "High-quality wireless headphones" },
        { id: "2", name: "Smart Watch", price: 199.99, description: "Feature-rich smartwatch" },
        { id: "3", name: "Laptop Stand", price: 49.99, description: "Ergonomic laptop stand" },
        { id: "4", name: "USB-C Cable", price: 19.99, description: "Fast charging USB-C cable" },
        { id: "5", name: "Bluetooth Speaker", price: 79.99, description: "Portable bluetooth speaker" },
        { id: "6", name: "Phone Case", price: 29.99, description: "Protective phone case" },
    ]

    test("should return all the products", () => {
        expect(ProductService.getAllProducts()).toMatchObject(PRODUCTS);
    });

    test("should get the product by its ID", () => {
        for (let i = 0; i < PRODUCTS.length; i++) {
            expect(ProductService.getProduct((i + 1).toString())).toStrictEqual(PRODUCTS[i]);
        }
    });

    test("should return true if a product with the ID exists", async () => {
        for (let id = -10; id <= 10; id++) {
            if (PRODUCTS.length >= id && id >= 1) {
                expect(ProductService.productExists(id.toString())).toBe(true);
            } else {
                expect(ProductService.productExists(id.toString())).toBe(false);
            }
        }
    });
});
