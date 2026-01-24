"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Utensils, Coffee, Sun, Moon } from "lucide-react"

interface Meal {
    name: string
    calories?: number
    nutrients?: string
    marketplaceProduct?: string | null
}

interface DailyMeals {
    breakfast: Meal
    lunch: Meal
    dinner: Meal
    snack: Meal
}

interface DailyTimelineProps {
    date: Date
    dayLabel: string
    meals: DailyMeals
}

export function DailyTimeline({ date, dayLabel, meals }: DailyTimelineProps) {
    const timeSlots = [
        { time: "07:00", label: "Sarapan", icon: Sun, meal: meals.breakfast, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
        { time: "10:00", label: "Snack Pagi", icon: Coffee, meal: meals.snack, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
        { time: "12:30", label: "Makan Siang", icon: Utensils, meal: meals.lunch, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
        { time: "15:30", label: "Snack Sore", icon: Coffee, meal: meals.snack, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" }, // Reusing snack for simplicity or could be different if data allows
        { time: "18:30", label: "Makan Malam", icon: Moon, meal: meals.dinner, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/20" },
    ]

    const now = new Date()
    const isToday = now.toDateString() === date.toDateString()
    const currentHour = now.getHours()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {dayLabel}
                    </h3>
                    <p className="text-muted-foreground">
                        {date.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                {isToday && (
                    <Badge variant="default" className="bg-primary/90">
                        Hari Ini
                    </Badge>
                )}
            </div>

            <div className="relative border-l-2 border-muted ml-4 md:ml-6 space-y-8 pb-4">
                {timeSlots.map((slot, index) => {
                    // Determine if this is the "Next" or "Current" meal to highlight
                    const slotHour = parseInt(slot.time.split(":")[0])
                    const isNext = isToday && currentHour < slotHour && (index === 0 || currentHour >= parseInt(timeSlots[index - 1].time.split(":")[0]))
                    // Simple logic: Highlight if it's the immediate next meal

                    // Better logic: Active if current time is within 1 hour range? 
                    // Let's just highlight the card heavily if it's the relevant time.

                    return (
                        <div key={index} className="relative pl-8 md:pl-10">
                            {/* Time Bubble */}
                            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-background ${slot.color.replace('text-', 'bg-')} ring-4 ring-background`} />

                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <div className="min-w-[80px] pt-1">
                                    <span className="font-mono text-sm font-semibold text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {slot.time}
                                    </span>
                                </div>

                                <Card className={`flex-1 transition-all duration-300 hover:shadow-md ${isNext ? 'ring-2 ring-primary shadow-lg scale-[1.01]' : 'glass'}`}>
                                    <CardContent className="p-4 flex gap-4 items-start">
                                        <div className={`p-3 rounded-xl ${slot.bg} ${slot.color}`}>
                                            <slot.icon className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-lg leading-none">{slot.label}</h4>
                                            <p className="font-medium text-foreground/90 text-base">{slot.meal?.name || "Menu belum ditentukan"}</p>

                                            {slot.meal?.nutrients && (
                                                <p className="text-sm text-muted-foreground mt-1 bg-muted/50 inline-block px-2 py-1 rounded">
                                                    {slot.meal.nutrients}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
