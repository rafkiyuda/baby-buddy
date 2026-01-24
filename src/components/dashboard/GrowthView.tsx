"use client"

import { useState, useEffect } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { addMeasurement } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateZScore } from "@/lib/growth-standards"
import { Plus, Ruler, Weight, Sparkles } from "lucide-react"

interface Measurement {
    id: string
    weight: number
    height: number
    date: Date
}

interface Profile {
    dob: Date | null
    gender: "MALE" | "FEMALE" | null
}

export function GrowthView({ measurements, profile }: { measurements: Measurement[], profile: Profile }) {
    const [isOpen, setIsOpen] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [insight, setInsight] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleAnalyze = async () => {
        setAnalyzing(true)
        const result = await getGrowthInsight()
        if (result.success && result.insight) {
            setInsight(result.insight)
        } else {
            console.error(result.message)
        }
        setAnalyzing(false)
    }

    const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Latest Stats
    const latest = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1] : null

    // Z-Score Calculation (if profile exists)
    const zScore = (latest && profile.dob && profile.gender)
        ? calculateZScore(latest.weight, profile.gender, profile.dob)
        : { status: "No Data", zScore: 0 }

    // Chart Data Preparation
    const chartData = sortedMeasurements.map(m => ({
        date: new Date(m.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }),
        weight: m.weight,
        height: m.height
    }))

    if (!isMounted) return null // Prevent hydration mismatch by rendering null on server/init

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                        <Weight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latest?.weight ?? "-"} kg</div>
                        <p className="text-xs text-muted-foreground">
                            {latest ? `Recorded on ${new Date(latest.date).toLocaleDateString()}` : "No data yet"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Height</CardTitle>
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latest?.height ?? "-"} cm</div>
                        <p className="text-xs text-muted-foreground">
                            Latest measurement
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">WHO Status</CardTitle>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${zScore.status === "Normal" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            zScore.status.includes("Underweight") ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                            {zScore.status}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Z: {zScore.zScore}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on WHO Child Growth Standards
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Growth Curve</CardTitle>
                            <CardDescription>Weight history over time</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleAnalyze} disabled={analyzing}>
                                <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                                {analyzing ? "Analyzing..." : "AI Insight"}
                            </Button>
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Add Data
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Measurement</DialogTitle>
                                    </DialogHeader>
                                    <form action={async (formData) => {
                                        await addMeasurement(null, formData)
                                        setIsOpen(false)
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input type="date" id="date" name="date" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="weight">Weight (kg)</Label>
                                                <Input type="number" step="0.1" id="weight" name="weight" placeholder="e.g. 12.5" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="height">Height (cm)</Label>
                                                <Input type="number" step="0.1" id="height" name="height" placeholder="e.g. 85.0" required />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full">Save Measurement</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}kg`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    dot={{ fill: "var(--background)", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* AI Insight Result */}
            {insight && (
                <Card className="col-span-4 border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            AI Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert text-sm">
                            <p className="whitespace-pre-line leading-relaxed">{insight}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

import { getGrowthInsight } from "@/lib/actions"
