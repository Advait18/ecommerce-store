export interface Product {
    id: string,
    name: string,
    price: number,
    description: string,
}

const PRODUCTS: Product[] = [
    { id: "1", name: "Wireless Headphones", price: 99.99, description: "High-quality wireless headphones" },
    { id: "2", name: "Smart Watch", price: 199.99, description: "Feature-rich smartwatch" },
    { id: "3", name: "Laptop Stand", price: 49.99, description: "Ergonomic laptop stand" },
    { id: "4", name: "USB-C Cable", price: 19.99, description: "Fast charging USB-C cable" },
    { id: "5", name: "Bluetooth Speaker", price: 79.99, description: "Portable bluetooth speaker" },
    { id: "6", name: "Phone Case", price: 29.99, description: "Protective phone case" },
]

export class ProductService {
    // Get All Products
    static getAllProducts(): Product[] {
        return PRODUCTS;
    }

    // Get Product By ID
    static getProduct(id: string): Product | null {
        return PRODUCTS.find((product) => product.id === id) || null;
    }

    // Check If A Product Exists
    static productExists(id: string): boolean {
        return PRODUCTS.some((product) => product.id === id);
    }
}