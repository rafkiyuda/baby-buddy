import Link from "next/link"
import { GrowthChart } from "@/components/dashboard/GrowthChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getSession } from "@/lib/session"
import prisma from "@/lib/db"
import { calculateZScore } from "@/lib/growth-standards"

export default async function DashboardPage() {
    const session = await getSession()
    const user = session?.userId ? await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            profiles: {
                where: { type: "CHILD" },
                include: { measurements: { orderBy: { date: 'asc' } } }
            }
        }
    }) : null

    const profile = user?.profiles[0]
    const latestMeasurement = profile?.measurements[profile.measurements.length - 1]

    const currentWeight = latestMeasurement?.weight ?? profile?.weight ?? 0
    const currentHeight = latestMeasurement?.height ?? profile?.height ?? 0

    // Calculate previous measurements for comparison (simple diff with 2nd to last)
    const prevMeasurement = profile?.measurements.length && profile.measurements.length > 1
        ? profile.measurements[profile.measurements.length - 2]
        : null

    const weightDiff = prevMeasurement ? (currentWeight - prevMeasurement.weight).toFixed(1) : "0"
    const heightDiff = prevMeasurement ? (currentHeight - prevMeasurement.height).toFixed(1) : "0"

    const zScoreData = (latestMeasurement && profile?.dob && profile?.gender)
        ? calculateZScore(currentWeight, profile.gender, profile.dob)
        : { zScore: 0, status: "No Data" }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
                    <p className="text-muted-foreground">Welcome back, here's {profile?.name || "Budi"}'s latest update.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
                        <Link href="/marketplace">
                            <span className="text-lg">🛒</span> Belanja Bahan
                        </Link>
                    </Button>
                    <Button className="w-full sm:w-auto gap-2" asChild>
                        <Link href="/dashboard/growth">
                            <Plus className="h-4 w-4" /> Log Measurement
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                        <span className="text-2xl">⚖️</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentWeight ? `${currentWeight} kg` : "-"}</div>
                        <p className="text-xs text-muted-foreground">
                            {prevMeasurement
                                ? `${weightDiff > "0" ? "+" : ""}${weightDiff}kg from last record`
                                : "No previous data"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Height / Length</CardTitle>
                        <span className="text-2xl">📏</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentHeight ? `${currentHeight} cm` : "-"}</div>
                        <p className="text-xs text-muted-foreground">
                            {prevMeasurement
                                ? `${heightDiff > "0" ? "+" : ""}${heightDiff}cm from last record`
                                : "No previous data"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Z-Score (WFA)</CardTitle>
                        <span className="text-2xl">📊</span>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${zScoreData.status === "Normal" ? "text-green-600" :
                            zScoreData.status.includes("Underweight") ? "text-amber-600" : "text-blue-600"
                            }`}>
                            {zScoreData.zScore || "-"}
                        </div>
                        <p className="text-xs text-muted-foreground">{zScoreData.status}</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Meal</CardTitle>
                        <span className="text-2xl">🥣</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Bubur Ayam</div>
                        <p className="text-xs text-muted-foreground">12:00 PM • Iron Rich</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <GrowthChart />
                </div>

                {/* Recent Activity / Insights */}
                <Card className="col-span-3 glass">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {latestMeasurement && (
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">Measured Weight</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(latestMeasurement.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="font-medium text-sm">{latestMeasurement.weight} kg</div>
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Finished Meal Plan</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                                <div className="font-medium text-sm">Week 12</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
