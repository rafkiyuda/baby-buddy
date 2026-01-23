import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Need to check if Avatar exists, if not I'll mock
import { Heart, MessageCircle, Share2 } from "lucide-react"

// Mock Data
const POSTS = [
    {
        id: 1,
        author: "Dr. Sarah Spock",
        role: "Pediatrician",
        title: "5 Superfoods for Brain Development",
        content: "Omega-3 fatty acids found in fish are crucial for your baby's brain growth. Try incorporating salmon or chia seeds into their diet twice a week...",
        tags: ["Nutrition", "Expert Tip"],
        likes: 124,
        comments: 42,
        time: "2h ago"
    },
    {
        id: 2,
        author: "Mama Budi",
        role: "Super Mom",
        title: "My toddler refuses broccoli! Help!",
        content: "I've tried steaming, roasting, and even hiding it in nuggets. Nothing works! Any creative recipes to sneak veggies in?",
        tags: ["Picky Eater", "Question"],
        likes: 15,
        comments: 8,
        time: "4h ago"
    },
    {
        id: 3,
        author: "BebyNest Team",
        role: "Official",
        title: "New Feature: Marketplace Integration",
        content: "You can now shop for ingredients directly from your meal plan! Check out the new Market tab.",
        tags: ["Update", "News"],
        likes: 89,
        comments: 12,
        time: "1d ago"
    }
]

export default function CommunityPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Community Hub</h2>
                <p className="text-muted-foreground">
                    Connect with other parents and get expert advice.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Feed */}
                <div className="md:col-span-2 space-y-6">
                    {POSTS.map((post) => (
                        <Card key={post.id} className="glass">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {post.author[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{post.author}</h4>
                                        <p className="text-xs text-muted-foreground">{post.role} • {post.time}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    •••
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <h3 className="font-bold text-lg">{post.title}</h3>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {post.content}
                                </p>
                                <div className="flex gap-2 pt-2">
                                    {post.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500">
                                    <Heart className="h-4 w-4" /> {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-500">
                                    <MessageCircle className="h-4 w-4" /> {post.comments}
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                    <Share2 className="h-4 w-4" /> Share
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="glass bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Trending Topics</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {["#MPASI", "#SleepTraining", "#Tantrums", "#Breastfeeding", "#DadLife"].map(tag => (
                                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                                    {tag}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="glass">
                        <CardHeader>
                            <CardTitle className="text-lg">Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300">FEB</span>
                                    <span className="font-bold text-lg">24</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Live Q&A: Dr. Spock</h4>
                                    <p className="text-xs text-muted-foreground">10:00 AM WIB • Zoom</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
