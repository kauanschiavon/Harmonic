import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const controller = new UserController();

router.post("/users", controller.create);
router.post("/login", controller.login);
router.get("/users", controller.findAll);
router.patch("/users/:id", controller.update);
router.delete("/users/:id", controller.delete);

export default router;
