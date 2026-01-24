"use client"

import { useState, useEffect } from "react"
import { getNotifications, Notification } from "@/lib/actions"
import { AlertCircle, AlertTriangle, Info, Bell } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
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
    }, [])

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent w-fit">
                    Notifikasi
                </h1>
                <p className="text-muted-foreground">
                    Stay updated with your child's health and activity.
                </p>
            </header>

            <Card className="border-none shadow-lg bg-card/50 glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Semua Notifikasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && (
                        <div className="text-center py-12 text-muted-foreground animate-pulse">
                            Checking for updates...
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">Tidak ada notifikasi baru</p>
                            <p className="text-sm mt-1">Anda sudah tertib mengikuti jadwal!</p>
                        </div>
                    )}

                    {!loading && notifications.map((n) => (
                        <Link
                            key={n.id}
                            href={n.link || "#"}
                            className="block group"
                        >
                            <div className={`flex gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${n.type === "DANGER"
                                    ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40"
                                    : n.type === "WARNING"
                                        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                                        : "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                }`}>
                                <div className="mt-1 flex-shrink-0">
                                    {n.type === "DANGER" && <AlertCircle className="h-6 w-6 text-red-500" />}
                                    {n.type === "WARNING" && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                                    {n.type === "INFO" && <Info className="h-6 w-6 text-blue-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className={`font-semibold ${n.type === "DANGER" ? "text-red-700 dark:text-red-400" :
                                                n.type === "WARNING" ? "text-amber-700 dark:text-amber-400" :
                                                    "text-blue-700 dark:text-blue-400"
                                            }`}>
                                            {n.title}
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(n.timestamp).toLocaleDateString("id-ID", {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
