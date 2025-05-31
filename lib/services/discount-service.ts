import { OrderService } from "./order-service"

//Discount Service - Manages discount code generation and validation

export interface DiscountCode {
    code: string
    isUsed: boolean
    createdAt: string
    usedAt?: string
}

const DISCOUNT_ORDER_INTERVAL = 3 // Every 3rd order gets a discount code
const DISCOUNT_PERCENTAGE = 10 // 10% discount

let discountCodes: DiscountCode[] = []

export class DiscountService {
    static readonly DISCOUNT_PERCENTAGE = DISCOUNT_PERCENTAGE

    // Generate a random discount code
    private static generateCode(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let result = "SAVE"
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    // Check if a new discount code should be generated based on order count
    static shouldGenerateDiscount(): boolean {
        const totalOrders = OrderService.getTotalOrderCount()
        return totalOrders > 0 && totalOrders % DISCOUNT_ORDER_INTERVAL === 0
    }

    // Generate a new discount code
    static generateDiscount(): string {
        const code = this.generateCode()

        const discountCode: DiscountCode = {
            code,
            isUsed: false,
            createdAt: new Date().toISOString(),
        }

        discountCodes.push(discountCode)
        return code
    }

    // Validate a discount code and calculate discount amount
    static validateDiscount(
        code: string,
        cartTotal: number,
    ): {
        isValid: boolean
        discountAmount?: number
        message?: string
    } {
        const discount = discountCodes.find((d) => d.code === code)

        if (!discount) {
            return {
                isValid: false,
                message: "Invalid discount code",
            }
        }

        if (discount.isUsed) {
            return {
                isValid: false,
                message: "Discount code has already been used",
            }
        }

        const discountAmount = (cartTotal * DISCOUNT_PERCENTAGE) / 100

        return {
            isValid: true,
            discountAmount,
        }
    }

    // Mark a discount code as used
    static useDiscount(code: string): boolean {
        const discount = discountCodes.find((d) => d.code === code)

        if (discount && !discount.isUsed) {
            discount.isUsed = true
            discount.usedAt = new Date().toISOString()
            return true
        }

        return false
    }

    // Get all discount codes
    static getAllDiscountCodes(): DiscountCode[] {
        return [...discountCodes]
    }

    // Get available (unused) discount codes
    static getAvailableDiscountCodes(): DiscountCode[] {
        return discountCodes.filter((d) => !d.isUsed)
    }

    // Get used discount codes
    static getUsedDiscountCodes(): DiscountCode[] {
        return discountCodes.filter((d) => d.isUsed)
    }

    // Get the next order number that will qualify for a discount
    static getNextDiscountOrderNumber(): number {
        const totalOrders = OrderService.getTotalOrderCount()
        const remainder = totalOrders % DISCOUNT_ORDER_INTERVAL

        if (remainder === 0) {
            return totalOrders + DISCOUNT_ORDER_INTERVAL
        } else {
            return totalOrders + (DISCOUNT_ORDER_INTERVAL - remainder)
        }
    }

    // Check if a specific order number qualifies for a discount
    static orderQualifiesForDiscount(orderNumber: number): boolean {
        return orderNumber > 0 && orderNumber % DISCOUNT_ORDER_INTERVAL === 0
    }

    static clearDiscountsForTest() {
        return discountCodes = [];
    }
}
