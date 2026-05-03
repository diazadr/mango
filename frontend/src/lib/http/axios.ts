import axios from "axios";

export const web = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
    },
});

export const api = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
    },
});

export default api;
