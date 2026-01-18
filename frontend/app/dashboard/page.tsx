"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Coffee,
    Bookmark, 
    Rss, 
    Filter, 
    RefreshCw,
    Mail,
    Calendar,
    Youtube,
    Terminal,
    Plus,
    Loader2,
    ArrowUp,
    ArrowDown,
    ChevronDown
} from "lucide-react";
import { QuickPickCard } from "@/app/components/QuickPickCard";
import { SavedItemCard } from "@/app/components/SavedItemCard";
import { FeedItem } from "@/app/components/FeedItem";
import { linksApi, SavedLink } from "@/app/lib/linksApi";

export default function Dashboard() {
    const [savedItems, setSavedItems] = useState<SavedLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState<'date' | 'title' | 'priority'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const observerTarget = useRef<HTMLDivElement>(null);

    const ITEMS_PER_PAGE = 3;

    const loadSavedItems = useCallback(async (pageNum: number, sortBy?: 'created_at' | 'title' | 'priority', sortOrder?: 'asc' | 'desc') => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const items = await linksApi.getSavedLinks(pageNum, ITEMS_PER_PAGE, sortBy, sortOrder);

            if (items.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }

            if (pageNum === 1) {
                setSavedItems(items);
            } else {
                setSavedItems(prev => [...prev, ...items]);
            }

            setPage(pageNum);
        } catch (error) {
            console.error("Error loading saved items:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Map frontend sort field to API field names
    const getApiSortField = (field: 'date' | 'title' | 'priority'): 'created_at' | 'title' | 'priority' => {
        if (field === 'date') return 'created_at';
        return field;
    };

    // Reset and reload when sort changes
    useEffect(() => {
        setHasMore(true);
        setPage(1);
        setSavedItems([]);
        const apiSortField = getApiSortField(sortField);
        loadSavedItems(1, apiSortField, sortDirection);
    }, [sortField, sortDirection, loadSavedItems]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    const apiSortField = getApiSortField(sortField);
                    loadSavedItems(page + 1, apiSortField, sortDirection);
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadingMore, loading, page, loadSavedItems, sortField, sortDirection]);

    const handleItemUpdate = useCallback((updatedItem: SavedLink) => {
        console.log('Updating item in dashboard:', updatedItem.id, 'is_consumed:', updatedItem.is_consumed);
        setSavedItems(prev =>
            prev.map(item => item.id === updatedItem.id ? { ...updatedItem } : item)
        );
    }, []);

    const handleItemDelete = useCallback((itemId: number) => {
        console.log('Deleting item from dashboard:', itemId);
        setSavedItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

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
            title: "Apple&apos;s rumored folding phone might be closer than we thought",
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


            <main className="container px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">
                        {currentTime} <span className="text-primary">•</span> Good Morning
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                        Here is what&apos;s happening today.
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
                    <div className="flex flex-col gap-6 h-[600px]">
                        <div className="flex items-center gap-3">
                            <Bookmark className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold">Saved for Later</h3>
                            <div className="ml-auto flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                                            {sortField === 'date' ? 'Date' : sortField === 'title' ? 'Title' : 'Priority'}
                                            <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSortField('date')}>
                                            Date Added
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortField('title')}>
                                            Title
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortField('priority')}>
                                            Priority
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={toggleSortDirection}
                                        >
                                            {sortDirection === 'asc' ? (
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            ) : (
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : savedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Bookmark className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">No saved items yet</p>
                                <p className="text-sm">Start saving interesting content!</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                    {savedItems.map((item) => (
                                        <SavedItemCard
                                            key={item.id}
                                            item={item}
                                            onUpdate={handleItemUpdate}
                                            onDelete={handleItemDelete}
                                        />
                                    ))}

                                    {hasMore && (
                                        <div ref={observerTarget} className="py-4 flex justify-center">
                                            {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                                        </div>
                                    )}

                                    {!hasMore && savedItems.length > 0 && (
                                        <div className="py-4 text-center text-sm text-muted-foreground">
                                            No more items to load
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
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