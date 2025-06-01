"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Settings, TrendingUp, Percent, Package, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

interface AdminStats {
    totalItemsPurchased: number,
    totalPurchaseAmount: number,
    discountCodes: Array<{
        code: string,
        isUsed: boolean,
        createdAt: string,
        usedAt?: string,
    }>,
    totalDiscountAmount: number,
    totalOrders: number,
    nextDiscountOrderNumber: number,
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/stats");
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateDiscountCode = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/admin/generate-discount", {
                method: "POST",
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Generated discount code: ${result.code}`);
                fetchStats(); // Refresh stats
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            alert("Failed to generate discount code");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="text-center">
                    <p>Failed to load admin statistics</p>
                    <Button onClick={fetchStats} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchStats} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={generateDiscountCode} disabled={isGenerating}>
                        {isGenerating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Percent className="h-4 w-4 mr-2" />}
                        Generate Discount Code
                    </Button>
                    <Button onClick={async () => { await signOut({ callbackUrl: "/" }) }} variant="outline" >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Next discount at order #{stats.nextDiscountOrderNumber}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Items Purchased</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItemsPurchased}</div>
                        <p className="text-xs text-muted-foreground">Total items sold</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalPurchaseAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Gross revenue</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalDiscountAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Total discount amount</p>
                    </CardContent>
                </Card>
            </div>

            {/* Discount Codes */}
            <Card>
                <CardHeader>
                    <CardTitle>Discount Codes</CardTitle>
                    <CardDescription>All generated discount codes and their usage status</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.discountCodes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No discount codes generated yet</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.discountCodes.map((discount, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{discount.code}</code>
                                            <Badge variant={discount.isUsed ? "secondary" : "default"}>
                                                {discount.isUsed ? "Used" : "Available"}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Created: {new Date(discount.createdAt).toLocaleDateString()}
                                            {discount.usedAt && (
                                                <span className="ml-2">| Used: {new Date(discount.usedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    {index < stats.discountCodes.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
