import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock } from "lucide-react";

interface SavedItemCardProps {
    type: string;
    title: string;
    author?: string;
    time?: string;
    duration?: string;
    hasVideo?: boolean;
    description?: string;
    readTime?: string;
    source?: string;
}

export function SavedItemCard({ 
    type, 
    title, 
    author, 
    time, 
    duration, 
    hasVideo, 
    description, 
    readTime, 
    source 
}: SavedItemCardProps) {
    return (
        <Card className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
            {hasVideo && (
                <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-primary">
                            <Play className="h-6 w-6 ml-1" />
                        </div>
                    </div>
                    <Badge className="absolute bottom-2 right-2 bg-black/80">
                        {duration}
                    </Badge>
                </div>
            )}
            <CardContent className="p-4">
                <p className="text-xs font-semibold text-primary mb-1 uppercase">
                    {type}
                </p>
                <h4 className="font-bold mb-2 line-clamp-2">
                    {title}
                </h4>
                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {description}
                    </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {readTime && (
                        <>
                            <Clock className="h-3 w-3" />
                            <span>{readTime}</span>
                            <span>•</span>
                        </>
                    )}
                    {author && <span>{author} • {time}</span>}
                    {source && <span>{source}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

