"use client"

import { Button } from "@/components/ui/button"
import { addToCart } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useState } from "react"

interface PurchaseButtonProps {
    items: {
        name: string;
        price: number;
        quantity: number;
        productId?: string;
        packageId?: string;
        imageUrl?: string;
    }[]
    text?: string
    className?: string
}

export function PurchaseButton({ items, text = "Beli Paket Ini", className }: PurchaseButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handlePurchase = async () => {
        setLoading(true)
        try {
            await addToCart(items)
            router.push("/dashboard/market")
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button className={`w-full gap-2 ${className || ""}`} onClick={handlePurchase} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {text}
        </Button>
    )
}
