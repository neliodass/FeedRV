"use client";

import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Coffee, Search, Settings, User} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/app/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();

    return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
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
                                <Button variant="outline" size="icon" onClick={logout}>
                                    <User className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </header>
                    {children}
                </SidebarInset>
            </SidebarProvider>
    );
}