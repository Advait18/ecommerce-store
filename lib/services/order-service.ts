import type { CartItem } from "./cart-service"

//Order Service - Manages order creation and tracking

export interface Order {
    id: string
    items: CartItem[]
    subtotal: number
    discountCode: string | null
    discountAmount: number
    finalAmount: number
    createdAt: string
}

let orders: Order[] = []
let orderCounter = 1

export class OrderService {
    //Create a new order
    static createOrder(orderData: {
        items: CartItem[]
        subtotal: number
        discountCode: string | null
        discountAmount: number
        finalAmount: number
    }): Order {
        const order: Order = {
            id: `ORD-${orderCounter.toString().padStart(4, "0")}`,
            items: [...orderData.items], // Deep copy to avoid reference issues
            subtotal: orderData.subtotal,
            discountCode: orderData.discountCode,
            discountAmount: orderData.discountAmount,
            finalAmount: orderData.finalAmount,
            createdAt: new Date().toISOString(),
        }

        orders.push(order)
        orderCounter++

        return order
    }

    // Get all Orders
    static getAllOrders(): Order[] {
        return [...orders]
    }

    // Get order by ID
    static getOrder(orderId: string): Order | null {
        return orders.find((order) => order.id === orderId) || null
    }

    //Get total number of orders 
    static getTotalOrderCount(): number {
        return orders.length
    }

    //Get orders with discount codes applied
    static getOrdersWithDiscounts(): Order[] {
        return orders.filter((order) => order.discountCode !== null)
    }

    //Calculate total revenue
    static getTotalRevenue(): number {
        return orders.reduce((total, order) => total + order.finalAmount, 0)
    }

    // Calculate total discount given
    static getTotalDiscountAmount(): number {
        return orders.reduce((total, order) => total + order.discountAmount, 0)
    }

    static clearOrdersForTest(): void {
        orders = [];
        orderCounter = 1;
    }
}
