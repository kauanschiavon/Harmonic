import { db } from "../database/connection";

export class FollowRepository {

  async follow(followerId: number, followingId: number): Promise<void> {
    await db("follows")
      .insert({ follower_id: followerId, following_id: followingId })
      .onConflict(["follower_id", "following_id"])
      .ignore(); // idempotente: não dá erro se já estiver seguindo
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    await db("follows")
      .where({ follower_id: followerId, following_id: followingId })
      .delete();
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const row = await db("follows")
      .where({ follower_id: followerId, following_id: followingId })
      .first();
    return !!row;
  }

  async getFollowers(userId: number) {
    return db("follows")
      .join("users", "users.id", "follows.follower_id")
      .where("follows.following_id", userId)
      .select("users.id", "users.username")
      .orderBy("follows.created_at", "desc");
  }

  async getFollowing(userId: number) {
    return db("follows")
      .join("users", "users.id", "follows.following_id")
      .where("follows.follower_id", userId)
      .select("users.id", "users.username")
      .orderBy("follows.created_at", "desc");
  }

  async getCounts(userId: number): Promise<{ followers: number; following: number }> {
    const [followers, following] = await Promise.all([
      db("follows").where("following_id", userId).count("* as count").first(),
      db("follows").where("follower_id",  userId).count("* as count").first(),
    ]);
    return {
      followers: Number(followers?.count ?? 0),
      following: Number(following?.count ?? 0),
    };
  }
}