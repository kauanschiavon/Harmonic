import api from "./api";

export interface Comment {
    id: number;
    review_id: number;
    user_id: number;
    username: string;
    photo_url?: string | null;
    text: string;
    create_time: string;
}

export const commentService = {
    async listByReview(reviewId: number): Promise<{ total: number; comments: Comment[] }> {
        const res = await api.get(`/reviews/${reviewId}/comments`);
        return res.data;
    },
    async create(reviewId: number, userId: number, text: string): Promise<Comment> {
        const res = await api.post<Comment>(`/reviews/${reviewId}/comments`, { review_id: reviewId, user_id: userId, text });
        return res.data;
    },
    async delete(commentId: number, userId: number): Promise<void> {
        await api.delete(`/comments/${commentId}`, { data: { user_id: userId } });
    },
};
