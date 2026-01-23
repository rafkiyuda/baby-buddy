import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, ShieldCheck, Heart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b glass sticky top-0 z-50">
        <div className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          BebyNest
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#testimonials" className="hover:text-primary transition-colors">Stories</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/onboarding">
            <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gradient-to-b from-background to-primary/5">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-6">
          ✨ Now with AI Meal Planning
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl mb-6">
          Scientific Growth Tracking <br className="hidden md:block" />
          <span className="text-primary">Powered by Love & AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          BebyNest helps you track your child's growth with WHO standards, generates personalized meal plans, and connects you with a community of super parents.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/onboarding">
            <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto">
              Start Tracking Free
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Trusted By */}
        <div className="mt-20 text-sm text-muted-foreground">
          <p className="mb-4">Trusted by 10,000+ Parents</p>
          <div className="flex justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Logos */}
            <div className="flex items-center gap-1"><ShieldCheck className="h-5 w-5" /> PediatricAssoc</div>
            <div className="flex items-center gap-1"><Star className="h-5 w-5" /> MomChoice</div>
            <div className="flex items-center gap-1"><Heart className="h-5 w-5" /> FamilyFirst</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-background px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to raise a healthy child</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📈"
              title="Growth Analytics"
              desc="Track Height, Weight, and BMI with precision using WHO Z-Score standards."
            />
            <FeatureCard
              icon="🍱"
              title="AI Meal Planner"
              desc="Get weekly, pediatrician-approved meal plans tailored to your child's needs."
            />
            <FeatureCard
              icon="🛒"
              title="Smart Shopping"
              desc="Automatically generate shopping lists from your meal plans in one click."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        © 2026 BebyNest Inc. Built with ❤️ for the future.
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl border bg-card/50 glass hover:shadow-lg transition-all duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  )
}
