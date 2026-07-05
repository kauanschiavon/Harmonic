import { FavoriteRepository } from "../repositories/FavoriteRepository";
import { MusicRepository } from "../repositories/MusicRepository";
import { favoriteschema } from "../schemas/FavoriteSchema";

export class FavoriteService{
    private static repository = new FavoriteRepository();
    private static musicrepository = new MusicRepository();

    static async add(data:unknown){
        const validated = favoriteschema.parse(data);

        await FavoriteService.musicrepository.findOrCreate({
            music_id:validated.music_id,
            title: validated.title ?? "título desconhecido",
            duration_ms: validated.duration,
            release_date: validated.releate_date ?? undefined,
        });

        const existing = await FavoriteService.repository.findOne(
            validated.user_id,
            validated.music_id
        );

        if(existing){
            throw new Error("Música já está nos favoritos");
        }

        return await FavoriteService.repository.create(
            validated.user_id,
            validated.music_id
        )
    }
        static async remove(userId: number, musicId: string){
            const existing = await FavoriteService.repository.findOne(userId, musicId);

            if(!existing){
                throw new Error("Esta música não está nos favoritos");
            }
            await FavoriteService.repository.delete(userId, musicId);
            return { message: "Música removieda dos favoritos"};
        }

        static async listByUser(userId:number){
            return await FavoriteService.repository.findAllByUser(userId);
        }
}