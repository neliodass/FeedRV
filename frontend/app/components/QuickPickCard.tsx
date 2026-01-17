import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp } from "lucide-react";

interface QuickPickCardProps {
    title: string;
    category: string;
    upvotes: number;
    comments: number;
    categoryColor: string;
}

export function QuickPickCard({ title, category, upvotes, comments, categoryColor }: QuickPickCardProps) {
    return (
        <Card 
            className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0"
        >
            <CardContent className="p-5 flex flex-col justify-between min-h-[200px]">
                <Badge className={`${categoryColor} w-fit mb-auto`}>
                    {category}
                </Badge>
                <div className="mt-4">
                    <p className="font-bold leading-snug line-clamp-2 mb-3">
                        {title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                            <ArrowUp className="h-3 w-3" /> {upvotes}
                        </span>
                        <span>•</span>
                        <span>{comments} comments</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

