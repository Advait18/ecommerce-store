import { NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order-service";
import { DiscountService } from "@/lib/services/discount-service";

// GET /api/admin/stats - Get admin statistics
export async function GET() {
    try {
        const orders = OrderService.getAllOrders();
        const discountCodes = DiscountService.getAllDiscountCodes();

        // Calculate statistics
        const totalItemsPurchased = orders.reduce((total, order) => {
            return total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0)
        }, 0);

        const totalPurchaseAmount = orders.reduce((total, order) => total + order.finalAmount, 0);
        const totalDiscountAmount = orders.reduce((total, order) => total + order.discountAmount, 0);

        const stats = {
            totalItemsPurchased,
            totalPurchaseAmount,
            discountCodes: discountCodes.map((discount) => ({
                code: discount.code,
                isUsed: discount.isUsed,
                createdAt: discount.createdAt,
                usedAt: discount.usedAt,
            })),
            totalDiscountAmount,
            totalOrders: orders.length,
            nextDiscountOrderNumber: DiscountService.getNextDiscountOrderNumber(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error getting admin stats:", error);
        return NextResponse.json({ message: "Failed to get admin statistics" }, { status: 500 });
    }
}
