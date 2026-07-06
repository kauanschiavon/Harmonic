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

export const reviewService = {

    // GET /reviews/feed — resenhas de todos os usuários, com autor e artista
    async getFeed(): Promise<FeedReview[]> {
        const response = await api.get<FeedReview[]>("/reviews/feed");
        return response.data;
    },
};
