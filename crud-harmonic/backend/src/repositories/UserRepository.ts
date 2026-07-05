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

        return await db("users").select("*");

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
        .select("id", "username", "bio", "photo_url")
        .where({ id })
        .first();
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