import * as React from "react"

import {SearchForm} from "@/components/search-form"
import {VersionSwitcher} from "@/components/version-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {familySync} from "detect-libc";
import {Icon} from "lucide-react";
import {DynamicIcon} from "lucide-react/dynamic";
import Link from "next/link";

// This is sample data.
const data = {
    navMain: [
        {
            title: "",
            url: "#",
            items: [
                {
                    title: "Dashboard",
                    icon: "house",
                    url: "/dashboard",
                },
                {
                    title: "Saved for later",
                    icon: "book-marked",
                    url: "/dashboard/saved",
                    isActive: false
                },
            ],
        },

    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <p className={"text-[2rem] font-bold  m-1"}>FeedRV</p>
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={item.isActive}>

                                            <Link href={item.url} className="flex items-center gap-2">
                                                <DynamicIcon
                                                    name={item.icon as any}
                                                    size={18}
                                                    strokeWidth={2}
                                                />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail/>
        </Sidebar>
    )
}
