"use client"

import { useFormStatus } from "react-dom"
import { createPregnancyProfile } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full text-lg h-12" disabled={pending}>
            {pending ? "Saving Profile..." : "Start Journey"}
        </Button>
    )
}

export function PregnancyProfileForm() {
    const [state, setState] = useState<{ message?: string; errors?: any; success?: boolean } | null>(null)

    async function handleSubmit(formData: FormData) {
        const result = await createPregnancyProfile(null, formData)
        setState(result)
        if (result.success) {
            // Redirect or show success
            // window.location.href = '/dashboard'
        }
    }

    return (
        <Card className="glass border-2 border-white/50 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Pregnancy Journey</CardTitle>
                <CardDescription className="text-center text-base">
                    Track your pregnancy week by week for tailored nutrition.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {state?.message && !state?.success && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                        {state.message}
                    </div>
                )}
                {state?.success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        {state.message} Redirecting...
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="pregnancyWeek" className="text-base text-gray-700">Current Week (1-42)</Label>
                        <Input
                            id="pregnancyWeek"
                            name="pregnancyWeek"
                            type="number"
                            min="1"
                            max="42"
                            placeholder="e.g. 12"
                            className="h-12 text-lg bg-white/70"
                            required
                        />
                        {state?.errors?.pregnancyWeek && <p className="text-red-500 text-sm">{state.errors.pregnancyWeek}</p>}
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
