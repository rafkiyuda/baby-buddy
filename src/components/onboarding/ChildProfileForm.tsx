"use client"

import { useFormStatus } from "react-dom"
import { createChildProfile } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
// import { useActionState } from "react" // React 19
// Stick to standard form action for now or simple logic.
// We'll use a wrapper to handle state.

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full text-lg h-12" disabled={pending}>
            {pending ? "Creating Profile..." : "Start Journey"}
        </Button>
    )
}

export function ChildProfileForm() {
    const [state, setState] = useState<{ message?: string; errors?: any; success?: boolean } | null>(null)

    async function handleSubmit(formData: FormData) {
        const result = await createChildProfile(null, formData)
        setState(result)
        if (result.success) {
            // Redirect or show success
            // window.location.href = '/dashboard' // Simple redirect for MVP
        }
    }

    return (
        <Card className="glass border-2 border-white/50 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Child Profile</CardTitle>
                <CardDescription className="text-center text-base">
                    Tell us about your little one to personalize their nutrition.
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
                        <Label htmlFor="name" className="text-base text-gray-700">Child's Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Budi" className="h-12 text-lg bg-white/70" required />
                        {state?.errors?.name && <p className="text-red-500 text-sm">{state.errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dob" className="text-base text-gray-700">Date of Birth</Label>
                            <Input id="dob" name="dob" type="date" className="h-12 text-lg bg-white/70" required />
                            {state?.errors?.dob && <p className="text-red-500 text-sm">{state.errors.dob}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender" className="text-base text-gray-700">Gender</Label>
                            <select
                                id="gender"
                                name="gender"
                                className="flex h-12 w-full rounded-lg border border-input bg-white/70 px-3 py-1 text-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                            >
                                <option value="MALE">Boy</option>
                                <option value="FEMALE">Girl</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight" className="text-base text-gray-700">Weight (kg)</Label>
                            <Input id="weight" name="weight" type="number" step="0.1" placeholder="0.0" className="h-12 text-lg bg-white/70" required />
                            {state?.errors?.weight && <p className="text-red-500 text-sm">{state.errors.weight}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height" className="text-base text-gray-700">Height (cm)</Label>
                            <Input id="height" name="height" type="number" step="0.1" placeholder="0.0" className="h-12 text-lg bg-white/70" required />
                            {state?.errors?.height && <p className="text-red-500 text-sm">{state.errors.height}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="allergies" className="text-base text-gray-700">Allergies (Optional)</Label>
                        <Input id="allergies" name="allergies" placeholder="e.g. Peanuts, Seafood" className="h-12 text-lg bg-white/70" />
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
