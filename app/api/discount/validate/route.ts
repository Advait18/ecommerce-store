import { type NextRequest, NextResponse } from "next/server"
import { DiscountService } from "@/lib/services/discount-service"


// POST /api/discount/validate - Validate discount code
// Body: { code: string, cartTotal: number }
export async function POST(request: NextRequest) {
    try {
        const { code, cartTotal } = await request.json()

        // Validate input
        if (!code || cartTotal === undefined || cartTotal < 0) {
            return NextResponse.json({ message: "Invalid discount code or cart total" }, { status: 400 })
        }

        // Validate discount
        const validation = DiscountService.validateDiscount(code, cartTotal)

        if (!validation.isValid) {
            return NextResponse.json({ message: validation.message }, { status: 400 })
        }

        return NextResponse.json({
            code,
            amount: validation.discountAmount,
            percentage: DiscountService.DISCOUNT_PERCENTAGE,
        })
    } catch (error) {
        console.error("Error validating discount:", error)
        return NextResponse.json({ message: "Failed to validate discount code" }, { status: 500 })
    }
}
