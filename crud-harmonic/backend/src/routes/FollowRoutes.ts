import { Router } from "express";
import { FollowController } from "../controllers/FollowController";

const router     = Router();
const controller = new FollowController();

// Seguir um usuário      → POST   /users/:id/follow     body: { follower_id }
// Deixar de seguir       → DELETE /users/:id/follow     body: { follower_id }
// Ver seguidores         → GET    /users/:id/followers
// Ver quem o usuário seg → GET    /users/:id/following
// Stats do perfil        → GET    /users/:id/stats?viewer_id=X

router.post  ("/users/:id/follow",     controller.follow);
router.delete("/users/:id/follow",     controller.unfollow);
router.get   ("/users/:id/followers",  controller.getFollowers);
router.get   ("/users/:id/following",  controller.getFollowing);
router.get   ("/users/:id/stats",      controller.getStats);

export default router;