"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bookmark,
    Link as LinkIcon,
    Trash2,
    ExternalLink,
    Plus,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { linksApi, SavedLink } from "@/app/lib/linksApi";

export default function SavePage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const loadSavedLinks = useCallback(async () => {
        try {
            const links = await linksApi.getSavedLinks();
            setSavedLinks(links);

            const hasPendingLinks = links.some(link => link.status === "pending");

            if (hasPendingLinks && !pollingIntervalRef.current) {
                pollingIntervalRef.current = setInterval(async () => {
                    const updatedLinks = await linksApi.getSavedLinks();
                    setSavedLinks(updatedLinks);

                    const stillPending = updatedLinks.some(link => link.status === "pending");
                    if (!stillPending && pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                }, 5000);
            } else if (!hasPendingLinks && pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        } catch (err) {
            console.error("Failed to load saved links:", err);
        }
    }, []);

    useEffect(() => {
        loadSavedLinks();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [loadSavedLinks]);

    const formatDate = (dateString: string): string => {
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
            const newLink = await linksApi.saveLink({ url });
            setSavedLinks([newLink, ...savedLinks]);
            setUrl("");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to save link");
            console.error("Save error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await linksApi.deleteLink(id);
            setSavedLinks(savedLinks.filter(link => link.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Bookmark className="h-10 w-10 text-primary" />
                            Save for Later
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Save links to read, watch, or review later
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add New Link
                        </CardTitle>
                        <CardDescription>
                            Paste a URL and we&apos;ll automatically extract the content
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
                                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="url"
                                            type="url"
                                            placeholder="https://example.com/article"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

                <div className="space-y-4">
                    {savedLinks.map((link) => (
                        <Card key={link.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold leading-tight">
                                                        {link.title || link.url}
                                                    </h3>
                                                    {link.status === "pending" ? (
                                                        <Badge variant="outline" className="gap-1">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Processing
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
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
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                </a>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(link.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {link.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {link.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 flex-wrap">
                                            {link.tags && link.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {link.tags.map((tag, index) => (
                                                        <Badge key={`${link.id}-tag-${index}`} variant="secondary" className="text-xs">
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {formatDate(link.saved_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {savedLinks.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg text-muted-foreground">
                                    No saved links yet. Add your first link above!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

