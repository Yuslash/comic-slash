import { getBaseUrl } from "../host";

const API_URL = `${getBaseUrl()}/api/auth`;

export const login = async (email: string, password: string) => {
    const r = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
    });
    if (!r.ok) throw new Error("Login failed");
    return r.json();
};

export const signup = async (username: string, email: string, password: string) => {
    const r = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
    });
    if (!r.ok) throw new Error("Signup failed");
    return r.json();
};

export const logout = async () => {
    const r = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
    });
    return r.json();
};

export const getMe = async () => {
    try {
        const r = await fetch(`${API_URL}/me`, {
            credentials: "include",
        });
        if (!r.ok) return null;
        return r.json();
    } catch (e) {
        return null;
    }
};

export const guestLogin = async () => {
    const r = await fetch(`${API_URL}/guest`, {
        method: "POST",
        credentials: "include",
    });
    if (!r.ok) throw new Error("Guest login failed");
    return r.json();
};
