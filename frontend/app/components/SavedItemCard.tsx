import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Play, CheckCircle2, Circle, Trash2, ExternalLink, Star } from "lucide-react";
import { SavedLink, linksApi } from "@/app/lib/linksApi";
import { useState } from "react";

interface SavedItemCardProps {
    item: SavedLink;
    onUpdate?: (updatedItem: SavedLink) => void;
    onDelete?: (itemId: number) => void;
}

export function SavedItemCard({ item, onUpdate, onDelete }: SavedItemCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isYoutube = item.source_type === "youtube";
    const thumbnail = item.image_url || item.item_metadata?.thumbnail;
    const creator = item.creator || item.item_metadata?.author;

    const handleToggleConsumed = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setIsUpdating(true);
        try {
            const updatedItem = item.is_consumed
                ? await linksApi.markAsUnconsumed(item.id)
                : await linksApi.markAsConsumed(item.id);

            if (onUpdate) {
                onUpdate(updatedItem);
            }
        } catch (error) {
            console.error("Error toggling consumed status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this item?")) {
            return;
        }

        setIsDeleting(true);
        try {
            await linksApi.deleteLink(item.id);
            if (onDelete) {
                onDelete(item.id);
            }
            setIsOpen(false);
        } catch (error) {
            console.error("Error deleting item:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCardClick = () => {
        setIsOpen(true);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <>
            <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                {isYoutube && thumbnail && (
                    <a href={item.url} target={"_blank"} rel={"noopener noreferrer"} onClick={(e) => e.stopPropagation()}>
                        <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                            <Image
                                src={thumbnail}
                                alt={item.title}
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all z-10">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-primary">
                                    <Play className="h-6 w-6 ml-1" />
                                </div>
                            </div>
                        </div>
                    </a>
                )}
                <CardContent className="p-4 cursor-pointer" onClick={handleCardClick}>
                    <p className="text-xs font-semibold text-primary mb-1 uppercase">
                        {item.source_type || "Link"}
                    </p>
                    <h4 className="font-bold mb-2 line-clamp-2">
                        {item.title}
                    </h4>

                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="text-xs">
                                    {tag.name}
                                </Badge>
                            ))}
                            {item.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{item.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {creator && <span>{creator}</span>}
                            {creator && <span>•</span>}
                            <span>{formatDate(item.created_at)}</span>
                        </div>

                        <Button
                            variant={item.is_consumed ? "default" : "outline"}
                            size="sm"
                            className="h-7 gap-1.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleConsumed(e);
                            }}
                            disabled={isUpdating}
                        >
                            {item.is_consumed ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span className="text-xs">Consumed</span>
                                </>
                            ) : (
                                <>
                                    <Circle className="h-3.5 w-3.5" />
                                    <span className="text-xs">Mark Read</span>
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
                        <SheetTitle className="text-2xl font-bold pr-8 leading-tight">{item.title}</SheetTitle>
                        <SheetDescription className="flex items-center gap-2 text-sm pt-2">
                            <Badge variant="outline" className="text-xs uppercase font-semibold">
                                {item.source_type || "Link"}
                            </Badge>
                            {creator && (
                                <>
                                    <span className="text-muted-foreground">•</span>
                                    <span>by {creator}</span>
                                </>
                            )}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-8 p-6 pb-24">
                        {/* Thumbnail for YouTube */}
                        {isYoutube && thumbnail && (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden group shadow-md hover:shadow-lg transition-all"
                            >
                                <Image
                                    src={thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 700px"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                    <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center text-primary shadow-xl">
                                        <Play className="h-10 w-10 ml-1.5" />
                                    </div>
                                </div>
                            </a>
                        )}

                        {/* URL */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">Source URL</h3>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-start gap-2 break-all font-medium"
                            >
                                <span className="flex-1">{item.url}</span>
                                <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            </a>
                        </div>

                        {/* Summary */}
                        {item.summary && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wide">AI Summary</h3>
                                <p className="text-base text-foreground leading-relaxed">
                                    {item.summary}
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        {item.description && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wide">Description</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* Priority Score */}
                        {item.priority !== undefined && (
                            <div className={`rounded-lg p-5 border ${
                                item.priority >= 7 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800'
                                    : item.priority >= 5
                                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800'
                                    : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800'
                            }`}>
                                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-4 tracking-wide">Content Quality Score</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Star className={`h-6 w-6 ${
                                            item.priority >= 7
                                                ? 'text-green-500 fill-green-500'
                                                : item.priority >= 5
                                                ? 'text-yellow-500 fill-yellow-500'
                                                : 'text-red-500 fill-red-500'
                                        }`} />
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-foreground">{item.priority}</span>
                                            <span className="text-lg text-muted-foreground">/10</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-secondary/50 rounded-full h-3 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full transition-all duration-500 shadow-sm ${
                                                    item.priority >= 7
                                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                                        : item.priority >= 5
                                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                                        : 'bg-gradient-to-r from-red-400 to-rose-500'
                                                }`}
                                                style={{ width: `${(item.priority / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wide">Processing Status</h3>
                            <Badge
                                variant={item.status === "completed" ? "default" : "secondary"}
                                className="capitalize text-sm px-3 py-1"
                            >
                                {item.status}
                            </Badge>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wide">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag) => (
                                        <Badge key={tag.id} variant="secondary" className="text-sm px-3 py-1">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wide">Timeline</h3>
                            <div className="text-sm space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="font-medium">{new Date(item.created_at).toLocaleString()}</span>
                                </div>
                                {item.saved_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Saved:</span>
                                        <span className="font-medium">{new Date(item.saved_at).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-6 border-t-2">
                            <Button
                                variant={item.is_consumed ? "outline" : "default"}
                                onClick={() => handleToggleConsumed()}
                                disabled={isUpdating}
                                className="w-full h-11 text-base font-medium"
                                size="lg"
                            >
                                {isUpdating ? (
                                    "Updating..."
                                ) : item.is_consumed ? (
                                    <>
                                        <Circle className="h-5 w-5 mr-2" />
                                        Mark as Unread
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 mr-2" />
                                        Mark as Consumed
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full h-11 text-base font-medium"
                                size="lg"
                            >
                                {isDeleting ? (
                                    "Deleting..."
                                ) : (
                                    <>
                                        <Trash2 className="h-5 w-5 mr-2" />
                                        Delete Item
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

