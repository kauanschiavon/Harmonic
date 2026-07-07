import { Request, Response } from "express";
import { ReviewLikeService } from "../services/reviewlikeservice";

export class ReviewLikeController {

  async like(req: Request, res: Response) {
    try {
      const reviewId = Number(req.params.reviewId as string);
      const result = await ReviewLikeService.like(reviewId, req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async unlike(req: Request, res: Response) {
    try {
      const reviewId = Number(req.params.reviewId as string);
      const result = await ReviewLikeService.unlike(reviewId, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async countLikes(req: Request, res: Response) {
    try {
      const reviewId = Number(req.params.reviewId as string);
      const result = await ReviewLikeService.countLikes(reviewId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }
}