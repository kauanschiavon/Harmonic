import { isAwaitKeyword } from "typescript";
import { db } from "../database/connection";
import { User } from "../models/User";

export class UserRepository {

    

    async create(user: User) {

    const [createdUser] = await db("users")
        .insert(user)
        .returning([
            "id",
            "username",
            "email",
            "bio",
            "photo_url"
        ]);

    return createdUser;
}

    async findAll() {

        return await db("users").select(
            "id",
            "username",
            "email",
            "bio",
            "photo_url",
            "role",
            "create_time"
        );

    }

    async findByEmail(email: string){
        return await db("users")
        .where({email})
        .first();
    }

    async findByUsername(username: string){
        return await db("users")
        .where({username})
        .first();
    }

    async findById(id: number) {
        return await db("users")
        .where({ id })
        .first();
    }

    // Perfil público: só os campos que podem ser vistos por outros usuários
    async findPublicProfileById(id: number) {
        return await db("users")
        .select("id", "username", "bio", "photo_url", "create_time")
        .where({ id })
        .first();
    }

    // Busca usuários pelo username (usado na busca do perfil)
    async searchByUsername(query: string) {
        return await db("users")
        .select("id", "username", "bio", "photo_url")
        .whereILike("username", `%${query}%`)
        .orderBy("username", "asc")
        .limit(20);
    }

    async update(id: number, data: Partial<User>) {

        await db("users")
            .where({ id })
            .update(data);
    }

    async delete(id: number) {

        await db("users")
            .where({ id })
            .delete();
    }
}