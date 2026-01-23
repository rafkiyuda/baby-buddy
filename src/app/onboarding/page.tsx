"use client"

import { useState } from "react"
import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm"
import { PregnancyProfileForm } from "@/components/onboarding/PregnancyProfileForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
    const [profileType, setProfileType] = useState<"CHILD" | "PREGNANCY" | null>(null)

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">BebyNest</h1>
                    <p className="text-muted-foreground">Let's personalize your experience</p>
                </div>

                {!profileType ? (
                    <Card className="glass border-2 border-white/50">
                        <CardContent className="pt-6 space-y-4">
                            <p className="text-center text-lg font-medium text-foreground">Who are we tracking for?</p>

                            <div className="grid gap-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-16 text-lg justify-start px-6 gap-4 hover:border-primary hover:bg-primary/5 group"
                                    onClick={() => setProfileType("PREGNANCY")}
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">🤰</span>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">I'm Pregnant</span>
                                        <span className="text-xs text-muted-foreground font-normal">Track pregnancy week & nutrition</span>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-16 text-lg justify-start px-6 gap-4 hover:border-primary hover:bg-primary/5 group"
                                    onClick={() => setProfileType("CHILD")}
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">👶</span>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">My Child</span>
                                        <span className="text-xs text-muted-foreground font-normal">Track growth, meals & allergies</span>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            onClick={() => setProfileType(null)}
                            className="pl-0 gap-2 hover:bg-transparent hover:text-primary"
                        >
                            ← Back
                        </Button>

                        {profileType === "CHILD" ? <ChildProfileForm /> : <PregnancyProfileForm />}
                    </div>
                )}
            </div>
        </div>
    )
}
