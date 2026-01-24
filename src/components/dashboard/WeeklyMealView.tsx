import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, Tag, Zap } from "lucide-react"
import Link from "next/link"
import { PurchaseButton } from "@/components/dashboard/PurchaseButton"

interface Meal {
    name: string;
    calories?: number;
    nutrients?: string;
    marketplaceProduct?: string | null;
}

interface DayPlan {
    day: string;
    meals: {
        breakfast: Meal;
        lunch: Meal;
        dinner: Meal;
        snack: Meal;
    }
}

interface RecommendedPackage {
    packageName: string;
    description: string;
    totalPrice: number;
    products: Array<{
        productName: string;
        quantity: number;
        price: number;
    }>;
    nutritionalBenefits?: string[];
    suitableFor: string;
}

interface WeeklyPlanData {
    weeklyPlan: DayPlan[];
    recommendedPackages?: RecommendedPackage[];
    summary?: {
        budgetAnalysis?: string;
    }
}

export function WeeklyMealView({ data }: { data: WeeklyPlanData | null }) {
    if (!data || !data.weeklyPlan) return null;

    return (
        <div className="space-y-8">
            {/* Recommended Packages Section */}
            {data.recommendedPackages && data.recommendedPackages.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            Rekomendasi Paket MPASI
                        </h3>
                        {data.summary?.budgetAnalysis && (
                            <Badge variant="outline" className="text-sm px-3 py-1 border-primary/30 bg-primary/5">
                                {data.summary.budgetAnalysis}
                            </Badge>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {data.recommendedPackages.map((pkg, idx) => (
                            <Card key={idx} className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-primary/90 hover:bg-primary mb-2">Recommended</Badge>
                                        <div className="font-bold text-lg text-primary">
                                            Rp {pkg.totalPrice.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                                    <CardDescription>{pkg.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">Produk dalam paket:</p>
                                        <ul className="text-sm space-y-1">
                                            {pkg.products.map((prod, i) => (
                                                <li key={i} className="flex justify-between items-center text-muted-foreground">
                                                    <span>• {prod.productName}</span>
                                                    <span className="text-xs opacity-70">x{prod.quantity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {pkg.nutritionalBenefits && (
                                        <div className="flex flex-wrap gap-1">
                                            {pkg.nutritionalBenefits.map((benefit, i) => (
                                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <PurchaseButton
                                        items={pkg.products.map(p => ({
                                            name: p.productName,
                                            price: p.price,
                                            quantity: p.quantity
                                        }))}
                                        text="Beli Paket Ini"
                                    />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Plan Grid */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">📅</span> Jadwal Makan Mingguan
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data.weeklyPlan.map((day, index) => (
                        <Card key={index} className="glass overflow-hidden flex flex-col">
                            <CardHeader className="bg-primary/5 pb-4">
                                <CardTitle className="text-lg text-primary">{day.day}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4 flex-1">
                                <MealItem title="Breakfast" icon="🍳" meal={day.meals.breakfast} />
                                <MealItem title="Lunch" icon="🍱" meal={day.meals.lunch} />
                                <MealItem title="Snack" icon="🍎" meal={day.meals.snack} />
                                <MealItem title="Dinner" icon="🍽️" meal={day.meals.dinner} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

function MealItem({ title, icon, meal }: { title: string, icon: string, meal: Meal }) {
    if (!meal) return null;
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{icon}</span> {title}
            </div>
            <p className="font-medium text-sm leading-snug">{meal.name}</p>
            {meal.nutrients && (
                <p className="text-xs text-muted-foreground line-clamp-2 bg-accent/50 p-1 rounded">
                    {meal.nutrients}
                </p>
            )}
            {meal.marketplaceProduct && (
                <div className="mt-1 flex items-center gap-1 text-xs text-primary font-medium">
                    <Tag className="h-3 w-3" />
                    <span className="truncate">{meal.marketplaceProduct}</span>
                </div>
            )}
        </div>
    )
}
