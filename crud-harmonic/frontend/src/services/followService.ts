import api from "./api";

export interface FollowUser {
    id: number;
    username: string;
}

export interface FollowStats {
    followers_count: number;
    following_count: number;
    is_following: boolean;
}

export const followService = {

    // POST /users/:id/follow — followerId passa a seguir o usuário :id
    async follow(userId: number, followerId: number): Promise<void> {
        await api.post(`/users/${userId}/follow`, { follower_id: followerId });
    },

    // DELETE /users/:id/follow — followerId deixa de seguir o usuário :id
    async unfollow(userId: number, followerId: number): Promise<void> {
        await api.delete(`/users/${userId}/follow`, { data: { follower_id: followerId } });
    },

    // GET /users/:id/followers
    async getFollowers(userId: number): Promise<FollowUser[]> {
        const response = await api.get<FollowUser[]>(`/users/${userId}/followers`);
        return response.data;
    },

    // GET /users/:id/following
    async getFollowing(userId: number): Promise<FollowUser[]> {
        const response = await api.get<FollowUser[]>(`/users/${userId}/following`);
        return response.data;
    },

    // GET /users/:id/stats?viewer_id=X
    async getStats(userId: number, viewerId: number): Promise<FollowStats> {
        const response = await api.get<FollowStats>(`/users/${userId}/stats`, {
            params: { viewer_id: viewerId },
        });
        return response.data;
    },
};
