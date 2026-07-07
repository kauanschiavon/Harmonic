import { Request, Response } from "express";
import { SongService } from "../services/songservice";

export class SongController {
  async getById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const song = await SongService.getSongDetail(id);
      return res.status(200).json(song);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message ?? "Música não encontrada"
      });
    }
  }
}
