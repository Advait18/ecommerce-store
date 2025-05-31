import { ProductService, type Product } from "./product-service"

//Cart Service - Manages shopping cart operations

export interface CartItem {
    productId: string
    quantity: number
    product: Product
}

export interface Cart {
    items: CartItem[]
    total: number
}

let currentCart: Cart = {
    items: [],
    total: 0,
}

export class CartService {
    // Calculate Cart Total
    private static calculateTotal(items: CartItem[]): number {
        return items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);
    }

    // Get current cart
    static getCart(): Cart {
        return { ...currentCart }
    }

    //Add item to cart or update quantity if item already exists
    static addToCart(productId: string, quantity: number): Cart {
        const product = ProductService.getProduct(productId)
        if (!product) {
            throw new Error("Product not found")
        }

        const existingItemIndex = currentCart.items.findIndex((item) => item.productId === productId)

        if (existingItemIndex >= 0) {
            // Update existing item quantity
            currentCart.items[existingItemIndex].quantity += quantity
        } else {
            // Add new item to cart
            currentCart.items.push({
                productId,
                quantity,
                product,
            })
        }

        // Recalculate total
        currentCart.total = this.calculateTotal(currentCart.items)
        return this.getCart()
    }

    //Update cart item quantity
    static updateCartItem(productId: string, quantity: number): Cart {
        const itemIndex = currentCart.items.findIndex((item) => item.productId === productId)

        if (itemIndex >= 0) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                currentCart.items.splice(itemIndex, 1)
            } else {
                // Update quantity
                currentCart.items[itemIndex].quantity = quantity
            }

            // Recalculate total
            currentCart.total = this.calculateTotal(currentCart.items)
        }

        return this.getCart()
    }

    //Remove item from cart
    static removeFromCart(productId: string): Cart {
        currentCart.items = currentCart.items.filter((item) => item.productId !== productId)

        // Recalculate total
        currentCart.total = this.calculateTotal(currentCart.items)

        return this.getCart()
    }

    //Clear entire cart
    static clearCart(): Cart {
        currentCart = {
            items: [],
            total: 0,
        }

        return this.getCart()
    }

    //Get cart item count
    static getItemCount(): number {
        return currentCart.items.reduce((total, item) => total + item.quantity, 0)
    }
}
