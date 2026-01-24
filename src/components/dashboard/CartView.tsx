"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag } from "lucide-react"
import { removeFromCart, checkoutCart } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

export function CartView({ items }: { items: CartItem[] }) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {items.length === 0 ? (
                    <div className="text-center py-12 glass rounded-xl space-y-4">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold text-muted-foreground">Keranjang kosong</h3>
                        <Button onClick={() => window.location.href = "/dashboard/market"}>
                            Belanja Sekarang
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <CartItemRow key={item.id} item={item} />
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <CartSummary items={items} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function CartItemRow({ item }: { item: CartItem }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRemove = async () => {
        setLoading(true)
        await removeFromCart(item.id)
        setLoading(false)
        // Router refresh handled by server action usually, but explicit refresh helps
        router.refresh()
    }

    return (
        <Card className="glass">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted/20 rounded-lg flex items-center justify-center text-2xl">
                        📦
                    </div>
                    <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">x{item.quantity}</div>
                    <Button variant="ghost" size="icon" onClick={handleRemove} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function CartSummary({ items }: { items: CartItem[] }) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCheckout = async () => {
        setLoading(true)
        const result = await checkoutCart()
        if (result.success) {
            router.push("/dashboard/checkout/success")
        } else {
            console.error(result.message)
            // Ideally show toast here
            setLoading(false)
        }
    }

    return (
        <Card className="glass sticky top-8">
            <CardHeader>
                <CardTitle>Ringkasan Belanja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full h-12 text-lg gap-2"
                    onClick={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <>Processing...</>
                    ) : (
                        <>Bayar Sekarang</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}


