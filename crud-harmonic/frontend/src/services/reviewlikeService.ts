import api from "./api";

export const reviewlikeService = {
    async like(reviewId: number, userId: number): Promise<{ total_likes: number }> {
        const res = await api.post(`/reviews/${reviewId}/like`, { user_id: userId });
        return res.data;
    },
    async unlike(reviewId: number, userId: number): Promise<{ total_likes: number }> {
        const res = await api.delete(`/reviews/${reviewId}/like`, { data: { user_id: userId } });
        return res.data;
    },
    async count(reviewId: number): Promise<{ total_likes: number }> {
        const res = await api.get(`/reviews/${reviewId}/likes`);
        return res.data;
    },
};
