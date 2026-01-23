"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SettingsPage() {
    const { permission, requestPermission, sendNotification } = useNotifications()
    const [remindersEnabled, setRemindersEnabled] = useState(false) // In real app, persist to DB/LocalStorage

    const handleToggle = async () => {
        if (permission !== "granted") {
            const granted = await requestPermission()
            if (granted) {
                setRemindersEnabled(true)
                sendNotification("BebyNest Reminders Enabled", "You will receive alerts for meal times.")
            }
        } else {
            // Toggle logic
            const newState = !remindersEnabled
            setRemindersEnabled(newState)
            if (newState) {
                sendNotification("Reminders Active", "We'll let you know when it's time to eat!")
            }
        }
    }

    return (
        <div className="container max-w-2xl py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <Card className="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" /> Meal Reminders
                    </CardTitle>
                    <CardDescription>
                        Get notified when it's time for breakfast, lunch, and dinner.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-medium">Browser Notifications</p>
                        <p className="text-sm text-muted-foreground">
                            Status: <span className="font-bold uppercase">{permission}</span>
                        </p>
                    </div>
                    <Button
                        onClick={handleToggle}
                        variant={remindersEnabled ? "outline" : "default"}
                    >
                        {remindersEnabled ? "Enabled" : "Enable Reminders"}
                    </Button>
                </CardContent>
            </Card>

            {/* Dev Tooling */}
            <Card className="glass opacity-50">
                <CardHeader>
                    <CardTitle className="text-sm">Debug</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" size="sm" onClick={() => sendNotification("Test Alert", "This is a test notification from BebyNest!")} disabled={permission !== "granted"}>
                        Test Notification
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
