import { Request, Response } from "express";
import { FollowService } from "../services/followservice";
import { followSchema } from "../schemas/FollowSchema";

export class FollowController {

  async follow(req: Request, res: Response) {
    try {
      const parsed      = followSchema.parse(req.body);
      const followerId  = parsed.follower_id;
      const followingId = Number(req.params.id);

      await FollowService.follow(followerId, followingId);
      return res.status(201).json({ message: "Seguindo!" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async unfollow(req: Request, res: Response) {
    try {
      const parsed      = followSchema.parse(req.body);
      const followerId  = parsed.follower_id;
      const followingId = Number(req.params.id);

      await FollowService.unfollow(followerId, followingId);
      return res.status(200).json({ message: "Deixou de seguir." });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async getFollowers(req: Request, res: Response) {
    try {
      const userId    = Number(req.params.id);
      const followers = await FollowService.getFollowers(userId);
      return res.json(followers);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async getFollowing(req: Request, res: Response) {
    try {
      const userId    = Number(req.params.id);
      const following = await FollowService.getFollowing(userId);
      return res.json(following);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const viewerId = Number(req.query.viewer_id);
      const targetId = Number(req.params.id);

      if (!viewerId) {
        return res.status(400).json({ message: "viewer_id é obrigatório na query." });
      }

      const stats = await FollowService.getStats(viewerId, targetId);
      return res.json(stats);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
}