import { reviewService } from "../services/reviewservice";
import { Request, Response } from "express";

export class ReviewController {
  async create(req: Request, res: Response) {
    try {
      const review = await reviewService.create(req.body);
      return res.status(201).json(review);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async findAll(req: Request, res: Response) {
    const reviews = await reviewService.findAll();
    return res.json(reviews);
  }

  // Feed com reviews de todos os usuários + autor + artista (página de Reviews)
  async findFeed(req: Request, res: Response) {
    const reviews = await reviewService.findAllWithAuthors();
    return res.json(reviews);
  }

  async update(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const review = await reviewService.findById(Number(id));

    // Só o dono da review (ou um admin) pode editá-la
    if (
      req.user &&
      req.user.role !== "admin" &&
      req.user.id !== review.user_id
    ) {
      return res.status(403).json({
        message: "Você não tem permissão para editar esta review",
      });
    }

    const updated = await reviewService.update(Number(id), req.body);

    return res.json(updated ?? { message: "Review atualizada" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const review = await reviewService.findById(Number(id));

      if (
        req.user &&
        req.user.role !== "admin" &&
        req.user.id !== review.user_id
      ) {
        return res.status(403).json({
          message: "Você não tem permissão para excluir esta review",
        });
      }

      await reviewService.delete(Number(id));

      return res.json({ message: "Review deletada" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
}