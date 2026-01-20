"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Bookmark,
    Filter,
    Loader2,
    Search,
    X,
    Youtube,
    FileText,
    Rss,
    MessageSquare,
    HelpCircle,
    Check,
    Cog
} from "lucide-react";
import { SavedItemCard } from "@/app/components/SavedItemCard";
import { linksApi, SavedLink } from "@/app/lib/linksApi";

type SourceType = 'youtube' | 'article' | 'reddit' | 'rss' | 'other';

export default function SavedPage() {
    const [savedItems, setSavedItems] = useState<SavedLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [sourceTypeFilter, setSourceTypeFilter] = useState<SourceType | undefined>(undefined);
    const [includeConsumed, setIncludeConsumed] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const ITEMS_PER_PAGE = 10;

    const loadSavedItems = useCallback(async (pageNum: number, query?: string, sourceType?: SourceType, includeConsumedItems: boolean = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const items = await linksApi.searchSavedLinks(
                pageNum,
                ITEMS_PER_PAGE,
                query,
                sourceType,
                includeConsumedItems
            );

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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setHasMore(true);
        setPage(1);
        setSavedItems([]);
        loadSavedItems(1, debouncedSearchQuery, sourceTypeFilter, includeConsumed);
    }, [debouncedSearchQuery, sourceTypeFilter, includeConsumed, loadSavedItems]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadSavedItems(page + 1, debouncedSearchQuery, sourceTypeFilter, includeConsumed);
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
    }, [hasMore, loadingMore, loading, page, loadSavedItems, debouncedSearchQuery, sourceTypeFilter, includeConsumed]);

    const handleItemUpdate = useCallback((updatedItem: SavedLink) => {
        setSavedItems(prev =>
            prev.map(item => item.id === updatedItem.id ? { ...updatedItem } : item)
        );
    }, []);

    const handleItemDelete = useCallback((itemId: number) => {
        setSavedItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const clearSearch = () => {
        setSearchQuery('');
    };

    const getSourceTypeIcon = (type?: SourceType) => {
        switch (type) {
            case 'youtube': return <Youtube className="h-4 w-4" />;
            case 'article': return <FileText className="h-4 w-4" />;
            case 'reddit': return <MessageSquare className="h-4 w-4" />;
            case 'rss': return <Rss className="h-4 w-4" />;
            case 'other': return <HelpCircle className="h-4 w-4" />;
            default: return <Filter className="h-4 w-4" />;
        }
    };

    const getSourceTypeLabel = (type?: SourceType) => {
        if (!type) return 'All Types';
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">
                        <Bookmark className="inline-block h-9 w-9 mr-3 text-primary" />
                        Saved for Later
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                        Your collection of bookmarked content.
                    </p>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search saved items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                onClick={clearSearch}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 gap-2 text-sm">
                                    {getSourceTypeIcon(sourceTypeFilter)}
                                    {getSourceTypeLabel(sourceTypeFilter)}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setSourceTypeFilter(undefined)}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    All Types
                                    {!sourceTypeFilter && <Check className="h-4 w-4 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSourceTypeFilter('youtube')}>
                                    <Youtube className="h-4 w-4 mr-2" />
                                    YouTube
                                    {sourceTypeFilter === 'youtube' && <Check className="h-4 w-4 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSourceTypeFilter('article')}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Article
                                    {sourceTypeFilter === 'article' && <Check className="h-4 w-4 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSourceTypeFilter('reddit')}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Reddit
                                    {sourceTypeFilter === 'reddit' && <Check className="h-4 w-4 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSourceTypeFilter('rss')}>
                                    <Rss className="h-4 w-4 mr-2" />
                                    RSS
                                    {sourceTypeFilter === 'rss' && <Check className="h-4 w-4 ml-auto" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSourceTypeFilter('other')}>
                                    <HelpCircle className="h-4 w-4 mr-2" />
                                    Other
                                    {sourceTypeFilter === 'other' && <Check className="h-4 w-4 ml-auto" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 gap-2 text-sm">
                                    <Cog className="h-4 w-4" />
                                    Options
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuCheckboxItem
                                    checked={includeConsumed}
                                    onCheckedChange={setIncludeConsumed}
                                >
                                    Include consumed items
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : savedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Bookmark className="h-16 w-16 mb-4 opacity-50" />
                        {searchQuery || sourceTypeFilter ? (
                            <>
                                <p className="text-lg font-medium">No results found</p>
                                <p className="text-sm">Try adjusting your search or filters</p>
                            </>
                        ) : (
                            <>
                                <p className="text-lg font-medium">No saved items yet</p>
                                <p className="text-sm">Start saving interesting content!</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedItems.map((item) => (
                                <SavedItemCard
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleItemUpdate}
                                    onDelete={handleItemDelete}
                                />
                            ))}
                        </div>
                        {hasMore && (
                            <div ref={observerTarget} className="flex justify-center py-8">
                                {loadingMore && (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                )}
                            </div>
                        )}

                        {!hasMore && savedItems.length > 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No more items to load
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

