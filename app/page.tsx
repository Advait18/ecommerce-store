"use client"
import { useState, useEffect } from "react"

import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  name: string
  price: number
  description: string
}

interface CartItem {
  productId: string
  quantity: number
  product: Product
}

interface Cart {
  items: CartItem[]
  total: number
}

const PRODUCTS: Product[] = [
  { id: "1", name: "Wireless Headphones", price: 99.99, description: "High-quality wireless headphones" },
  { id: "2", name: "Smart Watch", price: 199.99, description: "Feature-rich smartwatch" },
  { id: "3", name: "Laptop Stand", price: 49.99, description: "Ergonomic laptop stand" },
  { id: "4", name: "USB-C Cable", price: 19.99, description: "Fast charging USB-C cable" },
  { id: "5", name: "Bluetooth Speaker", price: 79.99, description: "Portable bluetooth speaker" },
  { id: "6", name: "Phone Case", price: 29.99, description: "Protective phone case" },
]

export default function EcommerceStore() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCart()
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const cartData = await response.json()
        setCart(cartData)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart)
        toast({
          title: "Added to cart",
          description: "Item successfully added to your cart",
        });
        setAppliedDiscount(null);
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    };

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        setAppliedDiscount(null);
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    };
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        setAppliedDiscount(null);
        toast({
          title: "Removed from cart",
          description: "Item removed from your cart",
        });
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    };
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discount code",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, cartTotal: cart.total }),
      });

      if (response.ok) {
        const discount = await response.json();
        setAppliedDiscount(discount);
        toast({
          title: "Discount applied!",
          description: `You saved $${discount.amount.toFixed(2)}`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Invalid discount code",
          description: error.message,
          variant: "destructive",
        });
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply discount code",
        variant: "destructive",
      });
    };
  };

  const checkout = async () => {
    if (cart.items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    };
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountCode: appliedDiscount?.code || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCart({ items: [], total: 0 });
        setAppliedDiscount(null);
        setDiscountCode("");

        toast({
          title: "Order placed successfully!",
          description: `Order #${result.orderId} - Total: $${result.finalAmount.toFixed(2)}`,
        });

        if (result.newDiscountCode) {
          toast({
            title: "Congratulations!",
            description: `You've earned a discount code: ${result.newDiscountCode}`,
          });
        };
      } else {
        const error = await response.json();
        toast({
          title: "Checkout failed",
          description: error.message,
          variant: "destructive",
        });
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    };
  };

  const finalTotal = cart.total - (appliedDiscount?.amount || 0);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingCart className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Ecommerce Store</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Products</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PRODUCTS.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => addToCart(product.id)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
                {cart.items.length > 0 && <Badge variant="secondary">{cart.items.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* Discount Code Section */}
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="discount"
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        disabled={!!appliedDiscount}
                      />
                      <Button onClick={applyDiscount} variant="outline" disabled={!!appliedDiscount}>
                        Apply
                      </Button>
                    </div>
                    {appliedDiscount && (
                      <div className="text-sm text-green-600">
                        ✓ Discount applied: -{appliedDiscount.code} (-$
                        {appliedDiscount.amount.toFixed(2)})
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${cart.total.toFixed(2)}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${appliedDiscount.amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            {cart.items.length > 0 && (
              <CardFooter>
                <Button onClick={checkout} className="w-full" disabled={isCheckingOut}>
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
