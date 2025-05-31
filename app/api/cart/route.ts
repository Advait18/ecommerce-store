import { type NextRequest, NextResponse } from "next/server"
import { CartService } from "@/lib/services/cart-service"
import { ProductService } from "@/lib/services/product-service"

// GET /api/cart - Get current cart
export async function GET() {
    try {
        const cart = CartService.getCart()
        return NextResponse.json(cart)
    } catch (error) {
        console.error("Error getting cart:", error)
        return NextResponse.json({ message: "Failed to get cart" }, { status: 500 })
    }
}

// POST /api/cart - Add item to cart
// Body: { productId: string, quantity: number }
export async function POST(request: NextRequest) {
    try {
        const { productId, quantity } = await request.json()

        // Validate input
        if (!productId || !quantity || quantity <= 0) {
            return NextResponse.json({ message: "Invalid productId or quantity" }, { status: 400 })
        }

        // Check if product exists
        const product = ProductService.getProduct(productId)
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 })
        }

        // Add to cart
        const updatedCart = CartService.addToCart(productId, quantity)
        return NextResponse.json(updatedCart)
    } catch (error) {
        console.error("Error adding to cart:", error)
        return NextResponse.json({ message: "Failed to add item to cart" }, { status: 500 })
    }
}


// PUT /api/cart - Update cart item quantity
// Body: { productId: string, quantity: number }
export async function PUT(request: NextRequest) {
    try {
        const { productId, quantity } = await request.json()

        // Validate input
        if (!productId || quantity < 0) {
            return NextResponse.json({ message: "Invalid productId or quantity" }, { status: 400 })
        }

        // Update cart
        const updatedCart = CartService.updateCartItem(productId, quantity)
        return NextResponse.json(updatedCart)
    } catch (error) {
        console.error("Error updating cart:", error)
        return NextResponse.json({ message: "Failed to update cart item" }, { status: 500 })
    }
}

//DELETE /api/cart - Remove item from cart
//Query: ?productId=string
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get("productId")

        if (!productId) {
            return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
        }

        // Remove from cart
        const updatedCart = CartService.removeFromCart(productId)
        return NextResponse.json(updatedCart)
    } catch (error) {
        console.error("Error removing from cart:", error)
        return NextResponse.json({ message: "Failed to remove item from cart" }, { status: 500 })
    }
}
