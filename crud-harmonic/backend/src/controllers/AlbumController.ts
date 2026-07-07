import { Request, Response } from "express";
import { AlbumService } from "../services/albumservice";

export class AlbumController {
  async getById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const album = await AlbumService.getAlbumDetail(id);
      return res.status(200).json(album);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message ?? "Álbum não encontrado"
      });
    }
  }
}
