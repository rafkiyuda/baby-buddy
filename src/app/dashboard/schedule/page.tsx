import prisma from "@/lib/db"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { DailyTimeline } from "@/components/dashboard/DailyTimeline"
import { Card } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs" // Using Tabs for day selector

export const dynamic = 'force-dynamic';

export default async function SchedulePage({ searchParams }: { searchParams: { day?: string } }) {
    const session = await getSession()
    if (!session || !session.userId) redirect("/login")

    // Fetch active meal plan
    const mealPlan = await prisma.mealPlan.findFirst({
        where: {
            isActive: true,
            // In a real app we'd filter by profileUserId matches session 
            // profile: { userId: session.userId } 
        },
        orderBy: { createdAt: 'desc' },
        include: { profile: true }
    })

    if (!mealPlan) {
        return (
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                    <CalendarDays className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Belum ada Jadwal</h3>
                <p className="text-muted-foreground">Buat Meal Plan terlebih dahulu untuk melihat jadwal harian.</p>
            </div>
        )
    }

    const { weeklyPlan } = mealPlan.ingredientsJson as any
    const createdAt = new Date(mealPlan.createdAt)
    const today = new Date()

    // Calculate current day relative to plan start
    // Difference in time
    const diffTime = Math.abs(today.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Default to day 1 if plan is fresh, or actual diff (modulo 7 if repeating)
    // For this MVP, let's assume 7 days loop or just fixed 7 days.
    // Let's cap at 7 for weekly.

    // Handling "selected day"
    // Users can click "Hari 1", "Hari 2" etc.
    // Or "Senin", "Selasa" mapped to day number.

    // Let's rely on searchParams.day (index 0-6)
    // Default to the actual "current day of the plan"
    let defaultDayIndex = (diffDays - 1) % 7 // 0-indexed
    if (defaultDayIndex < 0) defaultDayIndex = 0;

    const selectedDayIndex = searchParams.day ? parseInt(searchParams.day) : defaultDayIndex
    const selectedDayData = weeklyPlan[selectedDayIndex] || weeklyPlan[0]

    // Calculate actual date for the selected day
    const selectedDate = new Date(createdAt)
    selectedDate.setDate(createdAt.getDate() + selectedDayIndex)

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">Jadwal Makan</h2>
                <p className="text-muted-foreground">
                    Jadwal harian untuk {mealPlan.profile.name}.
                </p>
            </header>

            {/* Day Selector using a simple strip instead of Tabs strictly, or Tabs? 
                Let's use a scrollable flex container for mobile friendliness 
            */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mask-grad-r">
                {weeklyPlan.map((day: any, idx: number) => {
                    const d = new Date(createdAt)
                    d.setDate(createdAt.getDate() + idx)
                    const isToday = d.toDateString() === today.toDateString()
                    const isActive = idx === selectedDayIndex

                    return (
                        <a
                            key={idx}
                            href={`/dashboard/schedule?day=${idx}`}
                            className={`
                                flex flex-col items-center justify-center min-w-[70px] p-3 rounded-xl border transition-all cursor-pointer
                                ${isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                    : "bg-card hover:bg-muted border-border"
                                }
                                ${isToday && !isActive ? "border-primary/50 bg-primary/5" : ""}
                            `}
                        >
                            <span className="text-xs font-medium opacity-80">
                                {d.toLocaleDateString("id-ID", { weekday: 'short' })}
                            </span>
                            <span className="text-lg font-bold">
                                {d.getDate()}
                            </span>
                            {isToday && (
                                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Today</span>
                            )}
                        </a>
                    )
                })}
            </div>

            <DailyTimeline
                date={selectedDate}
                dayLabel={selectedDayData.day}
                meals={selectedDayData.meals}
            />
        </div>
    )
}
