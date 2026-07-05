import { FollowRepository } from "../repositories/FollowRepository";

const repository = new FollowRepository();

export class FollowService {

  static async follow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new Error("Você não pode seguir a si mesmo.");
    }
    await repository.follow(followerId, followingId);
  }

  static async unfollow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new Error("Operação inválida.");
    }
    await repository.unfollow(followerId, followingId);
  }

  static async getFollowers(userId: number) {
    return repository.getFollowers(userId);
  }

  static async getFollowing(userId: number) {
    return repository.getFollowing(userId);
  }

  static async getStats(viewerId: number, targetId: number) {
    const [counts, isFollowing] = await Promise.all([
      repository.getCounts(targetId),
      repository.isFollowing(viewerId, targetId),
    ]);
    return {
      followers_count: counts.followers,
      following_count: counts.following,
      is_following:    isFollowing,
    };
  }
}