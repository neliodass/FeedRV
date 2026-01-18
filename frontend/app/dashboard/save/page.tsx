"use client";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Bookmark, CheckCircle2, ExternalLink, Link as LinkIcon, Loader2, Plus, Trash2} from "lucide-react";
import {Label} from "@/components/ui/label";
import {linksApi, SavedLink} from "@/app/lib/linksApi";

export default function SavePage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sessionLinks, setSessionLinks] = useState<SavedLink[]>([]);


    useEffect(() => {
        const pendingLinks = sessionLinks.filter(link => link.status === "pending" || link.status === "processing");
        if (pendingLinks.length === 0) return;
        const intervalId = setInterval(async () => {
            try {
                const updates = await Promise.all(
                    pendingLinks.map(async (link) => {
                        try {
                            return await linksApi.getSavedLink(link.id);
                        } catch (e) {
                            console.error("Error fetching link status:", e);
                            return null;
                        }
                    })
                );
                setSessionLinks(currentSessionLinks => {
                    return currentSessionLinks.map(link => {
                        const update = updates.find(u => u && u.id === link.id);
                        if (update) {
                            const hasChanged =
                                update.status !== link.status ||
                                update.title !== link.title;

                            if (hasChanged) {
                                console.log('Link updated:', { id: link.id, old: link, new: update });
                                return update;
                            }
                        }
                        return link;
                    });
                });
            } catch (e) {
                console.error(e);
            }
        }, 2000);

        return () => clearInterval(intervalId);
    }, [sessionLinks]);


    const formatDate = (dateString?: string): string => {
        if (!dateString) return "Just now";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const newLink = await linksApi.saveLink({url});
            setSessionLinks(prev => [newLink, ...prev]);
            setUrl("");
        } catch (err: unknown) {
            const maybeErr = err as { response?: { data?: { detail?: string } } };
            setError(maybeErr.response?.data?.detail || "Failed to save link");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id: number) => {
        try {
            await linksApi.deleteLink(id);
            setSessionLinks(prev => prev.filter(link => link.id !== id));
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Bookmark className="h-10 w-10 text-primary"/>
                            Save for Later
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Add links to read, watch, or reference later.
                        </p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5"/>
                            Add New Link
                        </CardTitle>
                        <CardDescription>
                            Paste a URL to process it immediately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="url">URL</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LinkIcon
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                        <Input
                                            id="url"
                                            type="url"
                                            placeholder="https://example.com/article"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className={"pl-10"}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                                Saving...
                                            </>
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                {}
                <div className="space-y-4">
                    {sessionLinks.length > 0 && (
                        <h2 className="text-xl font-semibold px-1">Recently Added ({sessionLinks.length})</h2>
                    )}
                    {sessionLinks.map((link) => (
                        <Card key={link.id}
                              className="hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-top-4 duration-300">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold leading-tight">
                                                {link.title || link.url}
                                            </h3>
                                            {link.status === "pending" ? (
                                                <Badge variant="outline"
                                                       className="gap-1 bg-yellow-50  text-yellow-700 border-yellow-200">
                                                    <Loader2 className="h-3 w-3 animate-spin"/>
                                                    Pending...
                                                </Badge>
                                            ) : link.status === "processing" ? (
                                                <Badge variant="outline"
                                                       className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                                                    <Loader2 className="h-3 w-3 animate-spin"/>
                                                    Processing...
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary"
                                                       className="gap-1 bg-green-50 text-green-700 border-green-200">
                                                    <CheckCircle2 className="h-3 w-3"/>
                                                    Ready
                                                </Badge>
                                            )}
                                        </div>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                                        >
                                            {link.url}
                                            <ExternalLink className="h-3 w-3 flex-shrink-0"/>
                                        </a>
                                        {link.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {link.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 flex-wrap pt-1">
                                            {link.tags && link.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {link.tags.map((tag, index) => (
                                                        <Badge key={tag.id ?? `${link.id}-tag-${index}`}
                                                               variant="secondary" className="text-xs">
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                Added: {formatDate(link.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(link.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}