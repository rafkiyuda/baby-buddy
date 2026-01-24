import prisma from "@/lib/db"
import { aggregateIngredients } from "@/lib/marketplace"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBasket, CheckCircle2 } from "lucide-react"
import { PurchaseButton } from "@/components/dashboard/PurchaseButton"
import { ShoppingListEditor } from "@/components/dashboard/ShoppingListEditor"

export const dynamic = 'force-dynamic';

export default async function MarketPage() {
    let mealPlan = null;
    try {
        mealPlan = await prisma.mealPlan.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            include: { profile: true }
        })
    } catch (e) {
        console.warn("DB fetch failed:", e);
    }

    const shoppingList = aggregateIngredients(mealPlan?.ingredientsJson);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Belanja Bahan Mentah</h2>
                <p className="text-muted-foreground">
                    Shop ingredients for {mealPlan?.profile?.name || "your child"}'s weekly plan.
                </p>
            </div>

            {!mealPlan ? (
                <div className="flex flex-col items-center justify-center p-12 glass rounded-xl text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <ShoppingBasket className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Your cart is empty</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Generate a meal plan first to see the shopping list here.
                    </p>
                    <Button asChild>
                        <a href="/dashboard/meals">Go to Meal Plans</a>
                    </Button>
                </div>
            ) : (
                <ShoppingListEditor initialItems={shoppingList as any} />
            )}
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
