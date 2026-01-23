import { GrowthChart } from "@/components/dashboard/GrowthChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
                    <p className="text-muted-foreground">Welcome back, here's Budi's latest update.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Log Measurement
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
                        <div className="text-2xl font-bold">7.5 kg</div>
                        <p className="text-xs text-muted-foreground">+0.5kg from last month</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Height / Length</CardTitle>
                        <span className="text-2xl">📏</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68 cm</div>
                        <p className="text-xs text-muted-foreground">+2cm from last month</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Z-Score (WFA)</CardTitle>
                        <span className="text-2xl">📊</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">0.42</div>
                        <p className="text-xs text-muted-foreground">Normal Growth</p>
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
                            <div className="flex items-center gap-4">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Measured Weight</p>
                                    <p className="text-xs text-muted-foreground">Today at 9:00 AM</p>
                                </div>
                                <div className="font-medium text-sm">7.5 kg</div>
                            </div>
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
