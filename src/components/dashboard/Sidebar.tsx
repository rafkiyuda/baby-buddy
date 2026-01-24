"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { LayoutDashboard, Baby, Activity, ShoppingBasket, Settings, LogOut, User, Bell, Users, CalendarDays, FileText } from "lucide-react"
import { logout } from "@/lib/actions"
import { usePathname } from "next/navigation"

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden w-64 flex-col border-r bg-card/50 glass md:flex">
            <div className="p-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    BebyNest
                </h1>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                </div>
            </div>

            <nav className="flex-1 space-y-2 px-4">
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" active={pathname === "/dashboard"} />
                <NavItem href="/dashboard/transactions" icon={FileText} label="Transaksi" active={pathname === "/dashboard/transactions"} />
                <NavItem href="/dashboard/profile" icon={User} label="Profil Anak" active={pathname === "/dashboard/profile"} />
                <NavItem href="/dashboard/growth" icon={Activity} label="Growth Tracker" active={pathname === "/dashboard/growth"} />
                <NavItem href="/dashboard/schedule" icon={CalendarDays} label="Schedule" active={pathname === "/dashboard/schedule"} />
                <NavItem href="/dashboard/meals" icon={Baby} label="Meal Plans" active={pathname === "/dashboard/meals"} />
                <NavItem href="/dashboard/market" icon={ShoppingBasket} label="Carts" active={pathname === "/dashboard/market"} />
                <NavItem href="/dashboard/notifications" icon={Bell} label="Notifications" active={pathname === "/dashboard/notifications"} />
                <NavItem href="/dashboard/community" icon={Users} label="Community" active={pathname === "/dashboard/community"} />
            </nav>

            <div className="p-4 border-t border-border">
                <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    )
}
