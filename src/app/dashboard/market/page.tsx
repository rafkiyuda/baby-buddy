import prisma from "@/lib/db"
import { aggregateIngredients } from "@/lib/marketplace"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBasket, CheckCircle2 } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function MarketPage() {
    // Fetch active plan
    // Fetch active plan
    // Note: To enable real DB fetching, ensure DATABASE_URL is accessible during build and uncomment below.
    const mealPlan: any = null;

    /*
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
    */

    const shoppingList = aggregateIngredients(mealPlan?.ingredientsJson);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
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
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main List */}
                    <div className="md:col-span-2 space-y-6">
                        {["Produce", "Protein", "Pantry", "Other"].map((category) => {
                            const items = shoppingList.filter(i => i.category === category);
                            if (items.length === 0) return null;

                            return (
                                <Card key={category} className="glass">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {getCategoryIcon(category)} {category}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary cursor-pointer transition-colors" />
                                                    <span className="font-medium">{item.name}</span>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    x{item.count}
                                                </Badge>
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
                                    <span className="font-bold">{shoppingList.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Est. Cost</span>
                                    <span className="font-bold">Rp {(shoppingList.length * 15000).toLocaleString()}</span>
                                </div>

                                <Button className="w-full gap-2 text-lg h-12 mt-4">
                                    <ShoppingBasket className="h-5 w-5" /> Checkout
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Connected to Segari & Sayurbox
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
