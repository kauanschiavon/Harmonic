import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: { "Content-Type": "application/json" },
});

// injeta o token JWT automaticamente em toda requisição, se existir
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("harmonic_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
