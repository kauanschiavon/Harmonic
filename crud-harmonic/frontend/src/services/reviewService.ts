import api from "./api";

export interface FeedReview {
    id: number;
    user_id: number;
    music_id?: string | null;
    artist_id: string;
    note: number;
    text: string;
    create_time: string;
    username: string;
    user_photo?: string | null;
    artist_name?: string | null;
    artist_photo?: string | null;
    music_title?: string | null;
}

export interface CreateReviewData {
    user_id: number;
    artist_id: string;
    music_id?: string;
    note: number;
    text: string;
}

export interface UpdateReviewData {
    note?: number;
    text?: string;
}

export const reviewService = {

    // GET /reviews/feed — resenhas de todos os usuários, com autor e artista
    async getFeed(): Promise<FeedReview[]> {
        const response = await api.get<FeedReview[]>("/reviews/feed");
        return response.data;
    },

    // POST /reviews — cria uma review de uma música (e/ou artista)
    async create(data: CreateReviewData) {
        const response = await api.post("/reviews", data);
        return response.data;
    },

    // PATCH /reviews/:id — só o dono da review pode editar (nota e/ou texto)
    async update(id: number, data: UpdateReviewData) {
        const response = await api.patch(`/reviews/${id}`, data);
        return response.data;
    },

    // DELETE /reviews/:id — só o dono da review pode excluir
    async delete(id: number) {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    },
};
