import { getSession } from "@/lib/session"
import prisma from "@/lib/db"
import { CartView } from "@/components/dashboard/CartView"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic';

export default async function CartPage() {
    const session = await getSession()
    if (!session || !session.userId) redirect("/login")

    const cart = await prisma.cart.findUnique({
        where: { userId: session.userId },
        include: { items: true }
    })

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Keranjang Belanja</h2>
            <CartView items={cart?.items || []} />
        </div>
    )
}
