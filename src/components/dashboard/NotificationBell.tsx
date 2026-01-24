"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getNotifications, Notification } from "@/lib/actions"
import Link from "next/link"

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications()
                setNotifications(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchNotifications()

        // Poll every minute? Or just once on mount.
        // For dynamic UX, poll every 60s
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const hasUnread = notifications.length > 0

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {hasUnread && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                )}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover text-popover-foreground shadow-lg z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="font-semibold mb-3">Notifications</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {loading && <p className="text-sm text-muted-foreground text-center">Checking...</p>}

                            {!loading && notifications.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">All caught up! No new alerts.</p>
                            )}

                            {!loading && notifications.map(n => (
                                <Link
                                    key={n.id}
                                    href={n.link || "#"}
                                    className="block group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className={`flex gap-3 p-3 rounded-md transition-colors ${n.type === "DANGER" ? "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20" :
                                            n.type === "WARNING" ? "bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20" :
                                                "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                        }`}>
                                        <div className="mt-1">
                                            {n.type === "DANGER" && <AlertCircle className="h-4 w-4 text-red-500" />}
                                            {n.type === "WARNING" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                            {n.type === "INFO" && <Info className="h-4 w-4 text-blue-500" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${n.type === "DANGER" ? "text-red-700 dark:text-red-400" :
                                                    n.type === "WARNING" ? "text-amber-700 dark:text-amber-400" :
                                                        "text-blue-700 dark:text-blue-400"
                                                }`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {n.message}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
