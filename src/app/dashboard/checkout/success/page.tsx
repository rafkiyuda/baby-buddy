import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full animate-bounce">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Order Successful!</h1>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Thank you for your purchase. Your order has been placed and is being processed.
                </p>
            </div>

            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
                <Button asChild>
                    <Link href="/dashboard/market">Continue Shopping</Link>
                </Button>
            </div>
        </div>
    )
}
