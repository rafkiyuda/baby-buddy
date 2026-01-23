"use client"

import { useState } from "react"
import { generateMealPlanAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function MealPlanGenerator({
    onGenerate
}: {
    onGenerate: (plan: any) => void
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleGenerate() {
        setLoading(true)
        setError(null)

        try {
            const result = await generateMealPlanAction()
            if (result.success && result.data) {
                onGenerate(result.data)
            } else {
                setError(result.message || "Failed to generate plan")
            }
        } catch (e) {
            setError("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="glass border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">AI Nutritionist</h3>
                    <p className="text-sm text-muted-foreground">Generate a personalized weekly meal plan based on your child's growth.</p>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    size="lg"
                    className="w-full max-w-sm gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loading ? "Designing Menu..." : "Generate 7-Day Plan"}
                </Button>
            </CardContent>
        </Card>
    )
}
