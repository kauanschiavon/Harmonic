import api from "./api";

export interface User {
    id: number;
    username: string;
    email: string;
    photo_url?: string;
    bio?: string;
    role?: "user" | "admin";
    create_time?: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Review {
    id: number;
    user_id: number;
    music_id?: string | null;
    artist_id: string;
    note: number;
    text: string;
    create_time: string;
    artist_name?: string | null;
    music_title?: string | null;
}

export interface UserProfile {
    id: number;
    username: string;
    bio?: string;
    photo_url?: string;
    reviews: Review[];
}

export const userService = {

    // POST /users — cadastro
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/users", data);
        return response.data;
    },

    // POST /login
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/login", data);
        return response.data;
    },

    // GET /users
    async findAll(): Promise<User[]> {
        const response = await api.get<User[]>("/users");
        return response.data;
    },

    // GET /users/:id — perfil público (dados + reviews)
    async getProfile(id: number): Promise<UserProfile> {
        const response = await api.get<UserProfile>(`/users/${id}`);
        return response.data;
    },

    // PATCH /users/:id — só username/bio/photo_url podem ser editados por aqui
    async update(id: number, data: Partial<Pick<User, "username" | "bio" | "photo_url">>): Promise<Partial<User> & { id: number }> {
        const response = await api.patch<Partial<User> & { id: number }>(`/users/${id}`, data);
        return response.data;
    },

    // DELETE /users/:id
    async delete(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};
