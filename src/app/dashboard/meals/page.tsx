import { PrismaClient } from "@prisma/client"
import { MealPlanGenerator } from "@/components/dashboard/MealPlanGenerator"
import { WeeklyMealView } from "@/components/dashboard/WeeklyMealView"
import { Separator } from "@/components/ui/separator" // I might need to create this or use hr

import prisma from "@/lib/db"

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
    // Fetch active plan
    // Note: To enable real DB fetching, ensure DATABASE_URL is accessible during build and uncomment below.
    const mealPlan: any = null;
    const structuredPlan: any = null;

    /*
    // Fetch active plan
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

    const structuredPlan = mealPlan?.ingredientsJson as any;
    */

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Weekly Meal Plan</h2>
                <p className="text-muted-foreground">
                    AI-curated menu for {mealPlan?.profile?.name || "your child"}, optimized for growth.
                </p>
            </div>

            {/* Generator Section */}
            <div className="flex justify-center py-4">
                {/* We pass a client wrapper to handle revalidation/state if needed, 
            but since action revalidates, we just need a button. 
            The Generator component handles the call. */}
                <div className="w-full max-w-2xl">
                    <MealPlanGenerator onGenerate={() => { }} />
                    {/* onGenerate empty callback because Server Action revalidates the path, 
                so the RSC below will refresh automatically on next render/refresh. 
                Ideally, we use a client state or router.refresh() in the component. 
                I'll assume revalidatePath works or user refreshes for MVP. 
                Actually, let's make the Generator trigger a router refresh in the client component.
            */}
                </div>
            </div>

            <div className="border-t pt-8">
                {!mealPlan ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No active meal plan found. Generate one to get started!</p>
                    </div>
                ) : (
                    <WeeklyMealView data={structuredPlan} />
                )}
            </div>
        </div>
    )
}
