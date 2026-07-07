import { Request, Response } from "express";
import { PlaylistService } from "../services/playlistservice";

export class PlaylistController {

  async create(req: Request, res: Response) {
    try {
      const playlist = await PlaylistService.create(req.body);
      return res.status(201).json(playlist);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async listByUser(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId as string);
      const playlists = await PlaylistService.listByUser(userId);
      return res.status(200).json(playlists);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id as string);
      const playlist = await PlaylistService.getById(id);
      return res.status(200).json(playlist);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id as string);
      const playlist = await PlaylistService.update(id, req.body);
      return res.status(200).json(playlist);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id as string);
      const userId = Number(req.body.user_id);
      const result = await PlaylistService.delete(id, userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async addMusic(req: Request, res: Response) {
    try {
      const playlistId = Number(req.params.id as string);
      const result = await PlaylistService.addMusic(playlistId, req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async removeMusic(req: Request, res: Response) {
    try {
      const playlistId = Number(req.params.id as string);
      const musicId = req.params.musicId as string;
      const result = await PlaylistService.removeMusic(playlistId, musicId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }

  async reorder(req: Request, res: Response) {
    try {
      const playlistId = Number(req.params.id as string);
      const result = await PlaylistService.reorder(playlistId, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno"
      });
    }
  }
}