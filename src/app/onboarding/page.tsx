"use client"

import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm"

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">BebyNest</h1>
                    <p className="text-muted-foreground">Let's set up your child's profile</p>
                </div>

                <div className="space-y-4">
                    <ChildProfileForm />
                </div>
            </div>
        </div>
    )
}
