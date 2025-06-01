import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Settings, ShoppingCart } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ecommerce Store",
  description: "A simple ecommerce store with cart and checkout functionality",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-xl font-bold">
                  Ecommerce Store
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Store
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
