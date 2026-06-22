import { ReviewService } from "../services/reviewservice";
import { Request, Response } from "express";


export class ReviewController {
    async create(req: Request, res: Response){

        const review = 
            await ReviewService.create(req.body);

            return res.status(201).json(review)

    }

    async findAll(req: Request, res:Response){

        const reviews = 
        await ReviewService.findAll();

        return res.json(reviews)

    }

    async update(req:Request, res:Response){

        const {id } = req.params;

        await ReviewService.update(
            Number(id),
            req.body
        );
        return res.json({
            message: "Review atualizada"
        })

    }

    async delete(req:Request, res:Response){

        const {id} = req.params

        await ReviewService.delete(
            Number(id)
        );
        return res.json({
            message: "Review deletada"
        }
        );
    }
}
