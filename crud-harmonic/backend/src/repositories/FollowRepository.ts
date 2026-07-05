import { db } from "../database/connection";

export class FollowRepository {

  async follow(followerId: number, followingId: number): Promise<void> {
    await db("followers")
      .insert({ followers_id: followerId, following_id: followingId })
      .onConflict(["followers_id", "following_id"])
      .ignore();
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    await db("followers")
      .where({ followers_id: followerId, following_id: followingId })
      .delete();
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const row = await db("followers")
      .where({ followers_id: followerId, following_id: followingId })
      .first();
    return !!row;
  }

  async getFollowers(userId: number) {
    return db("followers")
      .join("users", "users.id", "followers.followers_id")
      .where("followers.following_id", userId)
      .select("users.id", "users.username")
      .orderBy("followers.followers_id", "desc");
  }

  async getFollowing(userId: number) {
    return db("followers")
      .join("users", "users.id", "followers.following_id")
      .where("followers.followers_id", userId)
      .select("users.id", "users.username")
      .orderBy("followers.following_id", "desc");
  }

  async getCounts(userId: number): Promise<{ followers: number; following: number }> {
    const [followers, following] = await Promise.all([
      db("followers").where("following_id", userId).count("* as count").first(),
      db("followers").where("followers_id", userId).count("* as count").first(),
    ]);
    return {
      followers: Number(followers?.count ?? 0),
      following: Number(following?.count ?? 0),
    };
  }
}