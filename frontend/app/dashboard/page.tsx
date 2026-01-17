"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    Search, 
    Settings, 
    User, 
    Coffee, 
    Bookmark, 
    Rss, 
    Filter, 
    RefreshCw,
    Mail,
    Calendar,
    Youtube,
    Terminal,
    Plus
} from "lucide-react";
import { QuickPickCard } from "@/app/components/QuickPickCard";
import { SavedItemCard } from "@/app/components/SavedItemCard";
import { FeedItem } from "@/app/components/FeedItem";

export default function Dashboard() {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });

    const quickPicks = [
        {
            id: 1,
            title: "Show HN: Minimalist Browser Dashboard with AI integration",
            category: "TECH",
            upvotes: 245,
            comments: 12,
            categoryColor: "bg-blue-500"
        },
        {
            id: 2,
            title: "Is it possible to build a truly private search engine in 2024?",
            category: "FUTURE",
            upvotes: 182,
            comments: 48,
            categoryColor: "bg-emerald-500"
        },
        {
            id: 3,
            title: "The future of distributed computing and edge nodes",
            category: "SYSTEMS",
            upvotes: 94,
            comments: 5,
            categoryColor: "bg-purple-500"
        }
    ];

    const savedItems = [
        {
            id: 1,
            type: "YouTube",
            title: "Modern UI Trends: Why Minimalism still wins in 2024",
            author: "DesignCourse",
            time: "2d ago",
            duration: "12:45",
            hasVideo: true
        },
        {
            id: 2,
            type: "Substack",
            title: "The Architecture of Clean Code: Lessons from 10 years in the industry",
            description: "Software design is not just about writing code that works; it's about writing code that lives and breathes with the team...",
            readTime: "8 min read",
            source: "Medium.com"
        }
    ];

    const feedItems = [
        {
            id: 1,
            source: "r/technology",
            title: "NASA confirms new Mars mission launch date for next year",
            time: "42m ago",
            upvotes: "1.2k",
            comments: 340,
            icon: "reddit"
        },
        {
            id: 2,
            source: "The Verge",
            title: "Apple's rumored folding phone might be closer than we thought",
            description: "New patents suggest a unique hinge design that eliminates the crease entirely...",
            time: "1h ago"
        },
        {
            id: 3,
            source: "r/webdev",
            title: "What is your favorite stack for a solo developer in 2024?",
            time: "2h ago",
            upvotes: 856,
            comments: 212,
            icon: "reddit"
        },
        {
            id: 4,
            source: "Dev.to",
            title: "10 CLI tools every developer should be using",
            time: "4h ago",
            tags: ["Productivity", "Tools"]
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                            <Coffee className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold">Morning Context</h2>
                    </div>
                    
                    <div className="flex-1 max-w-xl mx-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search the web or links..." 
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">
                        {currentTime} <span className="text-primary">•</span> Good Morning
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                        Here is what's happening today.
                    </p>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Coffee className="h-5 w-5 text-primary" />
                            Quick Picks for your coffee
                        </h2>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Top from Hacker News
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickPicks.map((pick) => (
                            <QuickPickCard
                                key={pick.id}
                                title={pick.title}
                                category={pick.category}
                                upvotes={pick.upvotes}
                                comments={pick.comments}
                                categoryColor={pick.categoryColor}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <Bookmark className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold">Saved for Later</h3>
                            <Badge variant="secondary" className="ml-auto">8 items</Badge>
                        </div>

                        <div className="flex flex-col gap-4">
                            {savedItems.map((item) => (
                                <SavedItemCard
                                    key={item.id}
                                    type={item.type}
                                    title={item.title}
                                    author={item.author}
                                    time={item.time}
                                    duration={item.duration}
                                    hasVideo={item.hasVideo}
                                    description={item.description}
                                    readTime={item.readTime}
                                    source={item.source}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <Rss className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold">Fresh Feed</h3>
                            <div className="ml-auto flex gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7">
                                    <Filter className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col divide-y">
                            {feedItems.map((item) => (
                                <FeedItem
                                    key={item.id}
                                    source={item.source}
                                    title={item.title}
                                    time={item.time}
                                    description={item.description}
                                    upvotes={item.upvotes}
                                    comments={item.comments}
                                    icon={item.icon}
                                    tags={item.tags}
                                />
                            ))}
                        </div>

                        <Button variant="outline" className="w-full">
                            Load More Feed
                        </Button>
                    </div>
                </div>

                <div className="h-20"></div>
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-md border rounded-2xl shadow-2xl">
                <Button variant="ghost" size="icon" className="rounded-xl">
                    <Mail className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl">
                    <Calendar className="h-5 w-5" />
                </Button>
                <div className="w-px h-6 bg-border mx-1"></div>
                <Button variant="ghost" size="icon" className="rounded-xl">
                    <Youtube className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl">
                    <Terminal className="h-5 w-5" />
                </Button>
                <div className="w-px h-6 bg-border mx-1"></div>
                <Button variant="ghost" size="icon" className="rounded-xl">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}