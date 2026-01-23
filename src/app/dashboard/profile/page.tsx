import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/session"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { Baby, Calendar, Ruler, Scale, AlertTriangle } from "lucide-react"

function calculateAge(dob: Date): string {
    const now = new Date()
    const ageInMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())

    if (ageInMonths < 12) {
        return `${ageInMonths} bulan`
    }

    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12

    if (months === 0) {
        return `${years} tahun`
    }
    return `${years} tahun ${months} bulan`
}

export default async function ProfilePage() {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            profiles: {
                where: { type: "CHILD" },
                orderBy: { createdAt: "desc" },
                take: 1
            }
        }
    })

    const profile = user?.profiles[0]

    if (!profile) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Profil Anak</h2>
                    <p className="text-muted-foreground">Belum ada profil anak yang terdaftar.</p>
                </div>
                <Card className="glass">
                    <CardContent className="pt-6 text-center">
                        <Baby className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Silakan lengkapi profil anak Anda terlebih dahulu.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Profil Anak</h2>
                <p className="text-muted-foreground">Informasi lengkap tentang si kecil.</p>
            </div>

            {/* Profile Card */}
            <Card className="glass overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary/80 to-accent/80" />
                <CardHeader className="-mt-12 pb-2">
                    <div className="flex items-end gap-4">
                        <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-800 border-4 border-background flex items-center justify-center shadow-lg">
                            <Baby className="h-12 w-12 text-primary" />
                        </div>
                        <div className="pb-2">
                            <CardTitle className="text-2xl">{profile.name || "Nama Anak"}</CardTitle>
                            <CardDescription className="text-base">
                                {profile.gender === "MALE" ? "Laki-laki" : "Perempuan"} • {profile.dob ? calculateAge(profile.dob) : "Usia tidak diketahui"}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tanggal Lahir</CardTitle>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {profile.dob ? new Date(profile.dob).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }) : "-"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Berat Badan</CardTitle>
                        <Scale className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{profile.weight ? `${profile.weight} kg` : "-"}</div>
                    </CardContent>
                </Card>

                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tinggi Badan</CardTitle>
                        <Ruler className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{profile.height ? `${profile.height} cm` : "-"}</div>
                    </CardContent>
                </Card>

                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alergi</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {profile.allergies && profile.allergies.length > 0
                                ? profile.allergies.join(", ")
                                : "Tidak ada"}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
