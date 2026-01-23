"use client"

import { useState } from "react"
import { generateMealPlanAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, Calendar, Package } from "lucide-react"

const DURATION_OPTIONS = [
    { value: 7, label: '1 Minggu', description: '7 hari menu' },
    { value: 14, label: '2 Minggu', description: '14 hari menu' },
    { value: 30, label: '1 Bulan', description: '30 hari menu' },
]

const LOCATION_OPTIONS = [
    { value: 'Jakarta', label: 'Jakarta' },
    { value: 'Bandung', label: 'Bandung' },
    { value: 'Surabaya', label: 'Surabaya' },
    { value: 'All Indonesia', label: 'Seluruh Indonesia' },
]

export function MealPlanGenerator() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState(7)
    const [budget, setBudget] = useState<string>("")
    const [location, setLocation] = useState<string>("All Indonesia")
    const [useBudget, setUseBudget] = useState(false)

    async function handleGenerate() {
        setLoading(true)
        setError(null)

        try {
            const budgetValue = useBudget && budget ? parseInt(budget.replace(/\D/g, '')) : undefined
            const result = await generateMealPlanAction(selectedDuration, budgetValue, location)

            if (result.success && result.data) {
                // Success - RSC will re-render due to revalidatePath
            } else {
                setError(result.message || "Gagal membuat rencana makan")
            }
        } catch (e) {
            setError("Terjadi kesalahan. Silakan coba lagi.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Nutritionist</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Buat rencana makan personal dengan rekomendasi produk MPASI berkualitas
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Duration Selector */}
                <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Pilih Durasi Rencana Makan
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {DURATION_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSelectedDuration(option.value)}
                                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${selectedDuration === option.value
                                    ? 'border-primary bg-primary/10 shadow-md'
                                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                                    }`}
                            >
                                <div className="font-semibold text-sm">{option.label}</div>
                                <div className="text-xs text-muted-foreground">{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Additional Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Lokasi Anda</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            {LOCATION_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Toggle & Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Batas Budget (Opsional)</label>
                            <input
                                type="checkbox"
                                checked={useBudget}
                                onChange={(e) => setUseBudget(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">Rp</span>
                            <input
                                type="text"
                                disabled={!useBudget}
                                placeholder="0"
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={budget}
                                onChange={(e) => {
                                    // Format as currency
                                    const val = e.target.value.replace(/\D/g, '')
                                    setBudget(val ? parseInt(val).toLocaleString('id-ID') : '')
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-accent">
                    <Package className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium">Termasuk Rekomendasi Produk</p>
                        <p className="text-muted-foreground">
                            AI akan merekomendasikan paket MPASI dari marketplace yang sesuai dengan kebutuhan anak Anda.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    size="lg"
                    className="w-full h-12 text-lg gap-2"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    {loading ? "Sedang Membuat Menu..." : `Buat Rencana ${selectedDuration} Hari`}
                </Button>
            </CardContent>
        </Card>
    )
}
