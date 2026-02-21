import { ChatInterface } from "@/components/dashboard/ChatInterface"
import { getSession } from "@/lib/session"
import prisma from "@/lib/db"

export default async function ChatbotPage() {
    const session = await getSession()
    if (!session || !session.userId) return null

    // We can fetch user's child profile data here to pass to the chat component for better context
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            profiles: {
                where: { type: "CHILD" },
                include: {
                    measurements: {
                        orderBy: { date: "desc" },
                        take: 1
                    }
                }
            }
        }
    })

    const childProfile = user?.profiles[0]

    const childContext = childProfile ? {
        name: childProfile.name,
        ageMonths: (new Date().getFullYear() - (childProfile.dob?.getFullYear() || new Date().getFullYear())) * 12 + (new Date().getMonth() - (childProfile.dob?.getMonth() || new Date().getMonth())),
        allergies: childProfile.allergies || [],
        latestWeight: childProfile.measurements[0]?.weight
    } : null

    return (
        <div className="flex-1 space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Pediatrician & Nutritionist</h1>
                <p className="text-muted-foreground">
                    Ask questions about your child's health, diet, and development. You can text or use the Live Call feature!
                </p>
            </div>

            <div className="flex-1 min-h-0 bg-card/50 glass border rounded-xl overflow-hidden relative">
                <ChatInterface childContext={childContext} />
            </div>
        </div>
    )
}
