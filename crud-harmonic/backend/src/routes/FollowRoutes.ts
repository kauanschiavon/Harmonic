import { Router } from "express";
import { FollowController } from "../controllers/FollowController";

const router     = Router();
const controller = new FollowController();



router.post  ("/users/:id/follow",     controller.follow);
router.delete("/users/:id/follow",     controller.unfollow);
router.get   ("/users/:id/followers",  controller.getFollowers);
router.get   ("/users/:id/following",  controller.getFollowing);
router.get   ("/users/:id/stats",      controller.getStats);

export default router;