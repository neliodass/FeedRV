import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, Circle } from "lucide-react";
import { SavedLink, linksApi } from "@/app/lib/linksApi";
import { useState } from "react";

interface SavedItemCardProps {
    item: SavedLink;
    onUpdate?: (updatedItem: SavedLink) => void;
}

export function SavedItemCard({ item, onUpdate }: SavedItemCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const isYoutube = item.source_type === "youtube";
    const thumbnail = item.image_url || item.item_metadata?.thumbnail;
    const creator = item.creator || item.item_metadata?.author;

    const handleToggleConsumed = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
        <Card className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
            {isYoutube && thumbnail && (
                <a href={item.url} target={"_blank"} rel={"noopener noreferrer"} >
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
            <CardContent className="p-4">
                <p className="text-xs font-semibold text-primary mb-1 uppercase">
                    {item.source_type || "Link"}
                </p>
                <h4 className="font-bold mb-2 line-clamp-2">
                    {item.title}
                </h4>
                {item.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.summary}
                    </p>
                )}

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
                        onClick={handleToggleConsumed}
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
    );
}

