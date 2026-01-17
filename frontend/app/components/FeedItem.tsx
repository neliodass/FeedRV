import { Badge } from "@/components/ui/badge";
import { Terminal, ThumbsUp, MessageSquare } from "lucide-react";

interface FeedItemProps {
    source: string;
    title: string;
    time: string;
    description?: string;
    upvotes?: string | number;
    comments?: number;
    icon?: string;
    tags?: string[];
}

export function FeedItem({ 
    source, 
    title, 
    time, 
    description, 
    upvotes, 
    comments, 
    icon, 
    tags 
}: FeedItemProps) {
    return (
        <div 
            className="py-4 hover:bg-accent/50 transition-colors rounded-lg px-2 -mx-2 cursor-pointer"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Terminal className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold">{source}</span>
                        <span className="text-[10px] text-muted-foreground">• {time}</span>
                    </div>
                    <h5 className="text-sm font-medium hover:text-primary transition-colors">
                        {title}
                    </h5>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {description}
                        </p>
                    )}
                    {(upvotes || comments) && (
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            {upvotes && (
                                <span className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" /> {upvotes}
                                </span>
                            )}
                            {comments && (
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" /> {comments}
                                </span>
                            )}
                        </div>
                    )}
                    {tags && (
                        <div className="flex gap-2 mt-2">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[9px]">
                                    {tag.toUpperCase()}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

