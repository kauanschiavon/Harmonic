import { Request, Response } from "express";
import { ArtistService } from "../services/artistservice";

export class ArtistController {
  async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const artist = await ArtistService.getProfile(id);
      return res.status(200).json(artist);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async getDiscography(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const discography = await ArtistService.getDiscography(id);
      return res.status(200).json(discography);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }
}