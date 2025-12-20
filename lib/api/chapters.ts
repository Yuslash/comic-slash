
import { getBaseUrl } from "../host";
import { ComicData } from "@/types/comic";

const API_BASE = `${getBaseUrl()}/api`;

export const getChapters = async (seriesId: string, mine = false) => {
    const query = mine ? `?mine=true` : '';
    const r = await fetch(`${API_BASE}/series/${seriesId}/chapters${query}`, {
        credentials: "include",
    });
    return r.json();
};

export const getChapterById = async (id: string) => {
    const r = await fetch(`${API_BASE}/chapters/${id}`, {
        credentials: "include",
    });
    if (!r.ok) return null;
    return r.json();
};

export const createChapter = async (seriesId: string, data: any) => {
    const r = await fetch(`${API_BASE}/series/${seriesId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to create chapter");
    return r.json();
};

export const saveChapter = async (id: string, data: ComicData) => {
    const r = await fetch(`${API_BASE}/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
        credentials: "include",
        keepalive: true, // Critical for saving on page unload
    });
    if (!r.ok) throw new Error("Failed to save chapter");
    return r.json();
};

export const updateChapterMetadata = async (id: string, metadata: any) => {
    const r = await fetch(`${API_BASE}/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata), // Sends title, coverImage, etc.
        credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to update chapter metadata");
    return r.json();
};

export const deleteChapter = async (seriesId: string, chapterId: string) => {
    const r = await fetch(`${API_BASE}/chapters/${chapterId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to delete chapter");
    return r.json();
};
