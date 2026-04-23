import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Public instance — no auth
export const publicAxios = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Factory: returns an axios instance with Basic Auth pre-configured
export function createAuthAxios(username, password) {
    const token = btoa(`${username}:${password}`);
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${token}`,
        },
    });
}
