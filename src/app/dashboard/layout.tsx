import Link from "next/link"
import { LayoutDashboard, Baby, Activity, ShoppingBasket, Settings, LogOut } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - Hidden on mobile, typically controlled by a Sheet/Drawer on mobile, but simplified here */}
            <aside className="hidden w-64 flex-col border-r bg-card/50 glass md:flex">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        BebyNest
                    </h1>
                </div>

                <nav className="flex-1 space-y-2 px-4">
                    <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </Link>
                    <Link href="/dashboard/growth" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Activity className="h-4 w-4" />
                        Growth Tracker
                    </Link>
                    <Link href="/dashboard/meals" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Baby className="h-4 w-4" />
                        Meal Plans
                    </Link>
                    <Link href="/dashboard/market" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <ShoppingBasket className="h-4 w-4" />
                        Marketplace
                    </Link>
                    <Link href="/dashboard/community" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <div className="h-4 w-4">👥</div>
                        Community
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
