import api from "@/app/lib/api";

export interface SaveLinkRequest {
    url: string;
}

export interface Tag {
    id: number;
    name: string;
}

export interface ItemMetadata {
    video_id?: string;
    type?: string;
    author?: string;
    title?: string;
    thumbnail?: string;
}

export interface SavedLink {
    id: number;
    url: string;
    title: string;
    source_type?: string;
    created_at: string;
    creator?: string;
    summary?: string;
    priority?: number;
    status: "pending" | "processing" | "completed";
    tags?: Tag[];
    item_metadata?: ItemMetadata;
    image_url?: string;
    is_consumed?: boolean;
    description?: string;
    saved_at?: string;
    user_id?: number;
}

export const linksApi = {
    async saveLink(data: SaveLinkRequest): Promise<SavedLink> {
        const response = await api.post("/items/", null, {
            params: { url: data.url }
        });
        return response.data;
    },

    async getSavedLinks(
        page: number = 0,
        items_per_batch: number = 10,
        sort_by: 'created_at' | 'title' | 'priority' = 'created_at',
        sort_order: 'asc' | 'desc' = 'desc',
    ): Promise<SavedLink[]> {
        const params: any = { page, items_per_batch };
        if(sort_by && sort_order) {
            params.sort = `${sort_by}:${sort_order}`;
        }

        const response = await api.get("/items/", { params });
        return response.data;
    },

    async getSavedLink(id: number): Promise<SavedLink> {
        const response = await api.get(`/items/${id}`);
        return response.data;
    },

    async deleteLink(linkId: number): Promise<void> {
        await api.delete(`/items/${linkId}`);
    },

    async updateLink(linkId: number, data: Partial<SaveLinkRequest>): Promise<SavedLink> {
        const response = await api.patch(`/items/${linkId}`, data);
        return response.data;
    },

    async markAsConsumed(linkId: number): Promise<SavedLink> {
        const response = await api.patch(`/items/${linkId}/consume?is_consumed=true`);
        return response.data;
    },

    async markAsUnconsumed(linkId: number): Promise<SavedLink> {
        const response = await api.patch(`/items/${linkId}/consume?is_consumed=false`);
        return response.data;
    }
};

