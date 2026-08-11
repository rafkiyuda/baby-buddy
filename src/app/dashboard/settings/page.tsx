"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
    const { permission, requestPermission, sendNotification } = useNotifications()
    const [remindersEnabled, setRemindersEnabled] = useState(false)

    const handleToggle = async () => {
        if (permission !== "granted") {
            const granted = await requestPermission()
            if (granted) {
                setRemindersEnabled(true)
                sendNotification("BabyBuddy Reminders Enabled", "You will receive alerts for meal times.")
            }
        } else {
            const newState = !remindersEnabled
            setRemindersEnabled(newState)
            if (newState) {
                sendNotification("Reminders Active", "We'll let you know when it's time to eat!")
            }
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
                <p className="text-muted-foreground">Manage your preferences and notifications.</p>
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
                    <Button variant="outline" size="sm" onClick={() => sendNotification("Test Alert", "This is a test notification from BabyBuddy!")} disabled={permission !== "granted"}>
                        Test Notification
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
