import { Request, Response } from "express";
import { FavoriteService } from "../services/favoriteservice";
export class FavoriteController {

  async add(req: Request, res: Response) {
    try {
      const favorite = await FavoriteService.add(req.body);
      return res.status(201).json(favorite);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

async remove(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const musicId = req.params.musicId as string;

      const result = await FavoriteService.remove(Number(userId), musicId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async listByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const favorites = await FavoriteService.listByUser(Number(userId));
      return res.status(200).json(favorites);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }
}