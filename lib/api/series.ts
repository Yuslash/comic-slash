
import { getBaseUrl } from "../host";

const API_BASE = `${getBaseUrl()}/api`;

export const getSeries = async (filter = 'popular', mine = false) => {
    const query = mine ? `filter=${filter}&mine=true` : `filter=${filter}`;
    const r = await fetch(`${API_BASE}/series?${query}`, {
        credentials: "include",
    });
    return r.json();
};

export const getSeriesById = async (id: string) => {
    const r = await fetch(`${API_BASE}/series/${id}`, {
        credentials: "include",
    });
    if (!r.ok) return null;
    return r.json();
};

export const createSeries = async (data: any) => {
    const r = await fetch(`${API_BASE}/series`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to create series");
    return r.json();
};

export const updateSeries = async (id: string, data: any) => {
    const r = await fetch(`${API_BASE}/series/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to update series");
    return r.json();
};

export const deleteSeries = async (id: string) => {
    const r = await fetch(`${API_BASE}/series/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to delete series");
    return r.json();
};
