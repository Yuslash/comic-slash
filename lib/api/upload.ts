import server, { getBaseUrl } from "../host";

const API_BASE = `${getBaseUrl()}/api`;

export const getUploadAuth = async () => {
    const r = await fetch(`${API_BASE}/upload/auth`, {
        credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to get upload auth");
    return r.json();
};
