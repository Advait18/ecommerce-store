import { NextResponse } from "next/server"
import { DiscountService } from "@/lib/services/discount-service"

// GET /api/admin/generate-discount - Manually generate a discount code
export async function GET() {
    try {
        const discountCode = DiscountService.generateDiscount()

        return NextResponse.json({
            code: discountCode,
            message: "Discount code generated successfully",
        })
    } catch (error) {
        console.error("Error generating discount code:", error)
        return NextResponse.json({ message: "Failed to generate discount code" }, { status: 500 })
    }
}
