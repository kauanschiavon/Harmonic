import { NumericLiteral } from "typescript";
import { ReviewRepository } from "../repositories/ReviewRepository";
import { reviewSchema } from "../schemas/ReviewSchema";


export class ReviewService {
//encapsular
    private static repository = new ReviewRepository();


    static async create(data: unknown) {

        const validatedData =
            reviewSchema.parse(data);

        if (
            !validatedData.music_spotify_id &&
            !validatedData.artist_spotify_id
        ) {
            throw new Error(
                "Informe music_id ou artist_id"
            );
        }

        return await ReviewService.repository.create(
            validatedData
        );
    }

    static async findAll() {
        return await ReviewService.repository.findAll();
    }

    static async update(
        id: number,
        data: any
    ) {
        return await ReviewService.repository.update(
            id,
            data
        );
    }

    static async delete(
        id: number
    ) {
        return await ReviewService.repository.delete(id);
    }

    static async findById(
        id:number
    ){
        const review = await ReviewService.repository.findById(id);
        if(!review) throw new Error ("Review não encontrada");
        return review;
    }
}