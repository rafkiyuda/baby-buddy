"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBasket, Plus, Minus, Trash2 } from "lucide-react"
import { PurchaseButton } from "@/components/dashboard/PurchaseButton"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface ShoppingItem {
    name: string;
    count: number;
    category: string;
    // Optional ID if we link to product DB later
    id?: string;
    price?: number;
}

export function ShoppingListEditor({ initialItems }: { initialItems: ShoppingItem[] }) {
    const [items, setItems] = useState<ShoppingItem[]>(initialItems)

    // Normalize items with prices if missing (defaulting to MVP price)
    useEffect(() => {
        setItems(initialItems.map(i => ({ ...i, price: i.price || 15000 })))
    }, [initialItems])

    const updateQuantity = (name: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.name === name) {
                const newCount = Math.max(0, item.count + delta)
                return { ...item, count: newCount }
            }
            return item
        }).filter(item => item.count > 0))
    }

    const removeItem = (name: string) => {
        setItems(prev => prev.filter(item => item.name !== name))
    }

    const totalItems = items.reduce((sum, item) => sum + item.count, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.count * (item.price || 15000)), 0)

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 glass rounded-xl text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                    <ShoppingBasket className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Daftar Belanja Kosong</h3>
                <p className="text-muted-foreground max-w-sm">
                    Generate meal plan baru atau tambah item manual.
                </p>
                <Button asChild>
                    <a href="/dashboard/meals">Ke Meal Plans</a>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid gap-8 md:grid-cols-3">
            {/* Main List */}
            <div className="md:col-span-2 space-y-6">
                {["Produce", "Protein", "Pantry", "Other"].map((category) => {
                    const categoryItems = items.filter(i => i.category === category);
                    if (categoryItems.length === 0) return null;

                    return (
                        <Card key={category} className="glass">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {getCategoryIcon(category)} {category}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {categoryItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {item.name[0]}
                                            </div>
                                            <span className="font-medium">{item.name}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-muted-foreground mr-2">
                                                Rp {(item.price || 15000).toLocaleString('id-ID')}
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(item.name, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-6 text-center font-bold text-sm">{item.count}</span>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(item.name, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(item.name)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Checkout / Summary */}
            <div className="md:col-span-1">
                <Card className="glass sticky top-4">
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Items</span>
                            <span className="font-bold">{totalItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Cost</span>
                            <span className="font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>

                        <PurchaseButton
                            items={items.map(i => ({
                                name: i.name,
                                quantity: i.count,
                                price: i.price || 15000
                            }))}
                            text="Checkout"
                            className="w-full gap-2 text-lg h-12 mt-4"
                        />
                        <p className="text-xs text-center text-muted-foreground">
                            Connected to Segari & Sayurbox
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function getCategoryIcon(category: string) {
    switch (category) {
        case "Produce": return "🥦";
        case "Protein": return "🥩";
        case "Pantry": return "🥫";
        default: return "📦";
    }
}
