import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Simple Badge component mock if not exists, or I'll just use standard span/tailwind for now if Badge isn't in UI lib.
// Wait, I haven't created Badge. I'll just use a styled span or add Badge later.
// I'll stick to 'div' with classes for badges.

interface Meal {
    name: string;
    calories?: number;
    nutrients?: string;
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

interface WeeklyPlanData {
    weeklyPlan: DayPlan[];
}

export function WeeklyMealView({ data }: { data: WeeklyPlanData | null }) {
    if (!data || !data.weeklyPlan) return null;

    return (
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
                <p className="text-xs text-muted-foreground line-clamp-2 bg-slate-100 dark:bg-slate-800 p-1 rounded">
                    {meal.nutrients}
                </p>
            )}
        </div>
    )
}
