"use client"

import { useState, useEffect } from "react"

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default")

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const requestPermission = async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            console.warn("Notifications not supported")
            return false
        }

        try {
            const result = await Notification.requestPermission()
            setPermission(result)
            return result === "granted"
        } catch (error) {
            console.error("Error requesting notification permission:", error)
            return false
        }
    }

    const sendNotification = (title: string, body: string) => {
        if (permission === "granted") {
            new Notification(title, {
                body,
                icon: "/icon.png", // Next.js usually serves /icon.png if present, or generic
            })
        }
    }

    return { permission, requestPermission, sendNotification }
}
