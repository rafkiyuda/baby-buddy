import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowRight, Star, ShieldCheck, Heart, LayoutDashboard, CheckCircle2, Menu, Sparkles, Store, MessageCircle, CreditCard, LogIn } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { getSession } from "@/lib/session"
import { logout } from "@/lib/actions"

export default async function LandingPage() {
  const session = await getSession()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar - Floating Pill */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full border glass z-50 px-6 h-16 flex items-center justify-between shadow-lg transition-all duration-300">
        <div className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          BebyNest
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
          <Link href="#testimonials" className="hover:text-primary transition-colors">Stories</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>

        <div className="flex gap-4 items-center">
          <ModeToggle />

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-4 items-center">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button>
                    Dashboard <LayoutDashboard className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <form action={logout}>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/onboarding">
                  <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 border-l border-border/50">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl">
                  <div className="p-6 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
                      BebyNest
                    </div>
                    <p className="text-sm text-muted-foreground">Smart parenting simplified.</p>
                  </div>

                  <nav className="flex-1 flex flex-col gap-2 p-6 overflow-y-auto">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 pl-4">Menu</p>
                    <Link href="#features" className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground">Features</span>
                    </Link>
                    <Link href="/marketplace" className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Store className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground">Marketplace</span>
                    </Link>
                    <Link href="#testimonials" className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground">Stories</span>
                    </Link>
                    <Link href="#pricing" className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground">Pricing</span>
                    </Link>
                  </nav>

                  <div className="p-6 border-t border-border/50 bg-muted/20">
                    {session ? (
                      <div className="space-y-3">
                        <Link href="/dashboard" className="w-full">
                          <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20" size="lg">
                            <LayoutDashboard className="mr-2 h-5 w-5" /> Go to Dashboard
                          </Button>
                        </Link>
                        <form action={logout} className="w-full">
                          <Button variant="ghost" className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                            Sign Out
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Link href="/login" className="w-full">
                          <Button variant="outline" className="w-full h-12" size="lg">
                            <LogIn className="mr-2 h-4 w-4" /> Log In
                          </Button>
                        </Link>
                        <Link href="/onboarding" className="w-full">
                          <Button className="w-full h-12 shadow-lg shadow-primary/20" size="lg">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 md:py-32 bg-gradient-to-b from-background to-primary/5">
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

      {/* Stories / Testimonials */}
      <section id="testimonials" className="py-24 bg-primary/5 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Stories from Super Parents</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            See how BebyNest is helping thousands of parents raise happy, healthy children with less stress.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <StoryCard
              name="Sarah, Mom of 2"
              role="Working Mom"
              quote="BebyNest changed how I track my baby's meals. The AI meal plans are a lifesaver and save me so much brain power!"
            />
            <StoryCard
              name="David P."
              role="New Dad"
              quote="The growth tracker gives me peace of mind. I love seeing the progress charts significantly more than the scribbled notes we used to keep."
            />
            <StoryCard
              name="Jessica M."
              role="Nutrition Enthusiast"
              quote="Shopping lists generated instantly? Yes please! It creates exactly what I need for the week without any food waste."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-background px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Simple Pricing for Growing Families</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Free Starter"
              price="Rp 0"
              description="Perfect for tracking basics"
              features={[
                "WHO Growth Tracking",
                "Basic Meal Recipes",
                "Community Access",
                "1 Child Profile"
              ]}
              buttonText="Start Free"
              href="/onboarding"
              variant="outline"
            />
            <PricingCard
              title="Super Parent"
              price="Rp 29.000"
              period="/ month"
              description="Unlock full AI capabilities"
              features={[
                "Advanced AI Growth Insights",
                "Personalized Weekly Meal Plans",
                "Auto-Generated Shopping Lists",
                "Unlimited Child Profiles",
                "Priority Support"
              ]}
              buttonText="Get Premium"
              href="/onboarding?plan=premium"
              variant="default"
              popular
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

function StoryCard({ name, role, quote }: { name: string, role: string, quote: string }) {
  return (
    <div className="p-8 rounded-2xl border bg-background/60 glass hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="flex-1">
        <div className="flex gap-1 text-yellow-500 mb-4">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
        </div>
        <p className="text-lg italic text-muted-foreground mb-6">"{quote}"</p>
      </div>
      <div className="flex items-center gap-4 border-t pt-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ title, price, period, description, features, buttonText, href, variant = "default", popular }: {
  title: string, price: string, period?: string, description: string, features: string[], buttonText: string, href: string, variant?: "default" | "outline", popular?: boolean
}) {
  return (
    <div className={`p-8 rounded-2xl border flex flex-col ${popular ? 'bg-background shadow-xl ring-2 ring-primary relative' : 'bg-card/50 glass'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-sm text-muted-foreground">{period}</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-4">{description}</p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className={`h-4 w-4 ${popular ? 'text-primary' : 'text-muted-foreground'}`} />
            {feature}
          </li>
        ))}
      </ul>
      <Link href={href} className="w-full">
        <Button className="w-full" variant={variant} size="lg">
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
