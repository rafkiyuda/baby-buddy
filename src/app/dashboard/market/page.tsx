import prisma from "@/lib/db"
import { getSession } from "@/lib/session"
import { aggregateIngredients } from "@/lib/marketplace"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBasket, CheckCircle2 } from "lucide-react"
import { PurchaseButton } from "@/components/dashboard/PurchaseButton"
import { ShoppingListEditor } from "@/components/dashboard/ShoppingListEditor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CartView } from "@/components/dashboard/CartView"

export const dynamic = 'force-dynamic';

export default async function MarketPage() {
    const session = await getSession()
    let mealPlan = null;
    let cart = null;

    try {
        const [plan, cartData] = await Promise.all([
            prisma.mealPlan.findFirst({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                include: { profile: true }
            }),
            session?.userId ? prisma.cart.findUnique({
                where: { userId: session.userId },
                include: { items: true }
            }) : null
        ])
        mealPlan = plan
        cart = cartData
    } catch (e) {
        console.warn("DB fetch failed:", e);
    }

    const shoppingList = aggregateIngredients(mealPlan?.ingredientsJson);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Belanja</h2>
                <p className="text-muted-foreground">
                    Manage your grocery list and cart.
                </p>
            </div>

            <Tabs defaultValue="market" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="market">Bahan Mentah</TabsTrigger>
                    <TabsTrigger value="cart">Keranjang</TabsTrigger>
                </TabsList>

                <TabsContent value="market" className="mt-6">
                    {!mealPlan ? (
                        <div className="flex flex-col items-center justify-center p-12 glass rounded-xl text-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <ShoppingBasket className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">Ready to shop?</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Generate a meal plan first to see the automated shopping list here.
                            </p>
                            <Button asChild>
                                <a href="/dashboard/meals">Go to Meal Plans</a>
                            </Button>
                        </div>
                    ) : (
                        <ShoppingListEditor initialItems={shoppingList as any} />
                    )}
                </TabsContent>

                <TabsContent value="cart" className="mt-6">
                    <CartView items={cart?.items || []} />
                </TabsContent>
            </Tabs>
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
