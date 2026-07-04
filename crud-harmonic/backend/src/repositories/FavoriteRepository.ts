import { db } from "../database/connection";
import { Favorite } from "../models/Favorite";

export class FavoriteRepository{
    async create(userId:number, musicId:string): Promise<Favorite>{
        const [created] = await db<Favorite>("favorites")
        .insert({user_id:userId, music_id:musicId})
        .returning("*");

        return created;
    }

    async findOne(userId: number, musicId:string): Promise<Favorite | undefined>{
        return await db<Favorite>("favorites")
        .where({user_id:userId, music_id:musicId})
        .first();
    }

    async delete(userId: number, musicId:string): Promise<number>{
        return await db("favorites")
        .where({user_id :userId, music_id: musicId})
        .delete();
    }

    async findAllByUser(userId: number){
        return await db("favorite as f")
        .join("music as m", "f.music_id", "m.music_id")
        .where("f.user_id", userId)
        .select(
            "m.music_id",
            "m.title",
            "m.duration_ms",
            "f.created_at"
        )
        .orderBy("f.created_at", "desc");
    }
}