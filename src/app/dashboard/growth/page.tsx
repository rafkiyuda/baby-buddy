import { getSession } from "@/lib/session"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { GrowthView } from "@/components/dashboard/GrowthView"

export default async function GrowthPage() {
    const session = await getSession()
    if (!session || !session.userId) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            profiles: {
                include: {
                    measurements: true
                }
            }
        }
    })

    if (!user) redirect("/login")

    // Find Child Profile
    const childProfile = user.profiles.find(p => p.type === "CHILD")

    if (!childProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <h1 className="text-2xl font-bold">No Child Profile Found</h1>
                <p className="text-muted-foreground">Please complete the onboarding to track growth.</p>
                {/* Could add a link to onboarding or profile creation */}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Growth Tracker</h1>
                <p className="text-muted-foreground">Monitor {childProfile.name}'s growth against WHO standards.</p>
            </div>

            <GrowthView
                measurements={childProfile.measurements}
                profile={{
                    dob: childProfile.dob,
                    gender: childProfile.gender
                }}
            />
        </div>
    )
}
