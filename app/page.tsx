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
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Products</h2>
          <div className="grid md:grid-cols-2 gap-8">
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
      </div>
    </div>
  );
}
