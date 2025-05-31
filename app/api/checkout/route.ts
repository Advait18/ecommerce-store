import { type NextRequest, NextResponse } from "next/server"
import { CartService } from "@/lib/services/cart-service"
import { OrderService } from "@/lib/services/order-service"
import { DiscountService } from "@/lib/services/discount-service"

// POST /api/checkout - Process checkout
// Body: { discountCode?: string }
export async function POST(request: NextRequest) {
    try {
        const { discountCode } = await request.json()

        const cart = CartService.getCart()

        // Validate cart is not empty
        if (cart.items.length === 0) {
            return NextResponse.json({ message: "Cart is empty" }, { status: 400 })
        }

        let discountAmount = 0
        let validatedDiscountCode = null

        // Validate discount code if provided
        if (discountCode) {
            const discountValidation = DiscountService.validateDiscount(discountCode, cart.total)
            if (!discountValidation.isValid) {
                return NextResponse.json({ message: discountValidation.message }, { status: 400 })
            }
            discountAmount = discountValidation.discountAmount!
            validatedDiscountCode = discountCode
        }

        const finalAmount = cart.total - discountAmount

        // Check if this order qualifies for a new discount code
        let newDiscountCode = null
        if (DiscountService.shouldGenerateDiscount()) {
            newDiscountCode = DiscountService.generateDiscount()
        }

        // Mark discount as used if applied
        if (validatedDiscountCode) {
            DiscountService.useDiscount(validatedDiscountCode)
        }

        const order = OrderService.createOrder({
            items: cart.items,
            subtotal: cart.total,
            discountCode: validatedDiscountCode,
            discountAmount,
            finalAmount,
        })

        CartService.clearCart()

        return NextResponse.json({
            orderId: order.id,
            finalAmount: order.finalAmount,
            discountApplied: order.discountAmount > 0,
            discountAmount: order.discountAmount,
            newDiscountCode,
        })
    } catch (error) {
        console.error("Error processing checkout:", error)
        return NextResponse.json({ message: "Failed to process checkout" }, { status: 500 })
    }
}
