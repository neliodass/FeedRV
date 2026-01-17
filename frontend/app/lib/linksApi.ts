import api from "@/app/lib/api";

export interface SaveLinkRequest {
    url: string;
}

export interface Tag {
    id: number;
    name: string;
}

export interface SavedLink {
    id: number;
    url: string;
    title?: string;
    description?: string;
    tags?: Tag[];
    saved_at: string;
    status: "pending" | "processed";
    user_id?: number;
}

export const linksApi = {
    async saveLink(data: SaveLinkRequest): Promise<SavedLink> {
        const response = await api.post("/items/", null, {
            params: { url: data.url }
        });
        return response.data;
    },

    async getSavedLinks(): Promise<SavedLink[]> {
        const response = await api.get("/items/");
        return response.data;
    },

    async deleteLink(linkId: number): Promise<void> {
        await api.delete(`/items/${linkId}`);
    },

    async updateLink(linkId: number, data: Partial<SaveLinkRequest>): Promise<SavedLink> {
        const response = await api.patch(`/items/${linkId}`, data);
        return response.data;
    }
};

