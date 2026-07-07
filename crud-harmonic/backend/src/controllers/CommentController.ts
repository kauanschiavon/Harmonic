import { Request, Response } from "express";
import { CommentService } from "../services/commentservice";

export class CommentController {

  async create(req: Request, res: Response) {
    try {
      const comment = await CommentService.create(req.body);
      return res.status(201).json(comment);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async listByReview(req: Request, res: Response) {
    try {
      const reviewId = Number(req.params.reviewId as string);
      const result = await CommentService.listByReview(reviewId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id     = Number(req.params.id as string);
      const userId = Number(req.body.user_id);

      const comment = await CommentService.update(id, userId, req.body);
      return res.status(200).json(comment);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id       = Number(req.params.id as string);
      const userId   = Number(req.body.user_id);
      const userRole = req.body.user_role ?? "user";

      const result = await CommentService.delete(id, userId, userRole);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }
}