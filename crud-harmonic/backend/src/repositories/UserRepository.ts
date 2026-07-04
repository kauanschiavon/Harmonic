import { db } from "../database/connection";
import { User } from "../models/User";

export class UserRepository {

    async create(user: Omit<User, "id">) {
        const [createdUser] = await db("users")
            .insert(user)
            .returning(["id", "username", "email", "bio", "photo_url"]);
        return createdUser;
    }

    async findAll() {
        return await db("users").select("id", "username", "email", "bio", "photo_url", "created_at");
    }

    async findById(id: number) {
        return await db("users").where({ id }).first();
    }

    async findByEmail(email: string) {
        return await db("users").where({ email }).first();
    }

    async findByUsername(username: string) {
        return await db("users").where({ username }).first();
    }

    async update(id: number, data: Partial<User>) {
        const [updated] = await db("users").where({ id }).update(data).returning(["id", "username", "email", "bio", "photo_url"]);
        return updated;
    }

    async delete(id: number) {
        await db("users").where({ id }).delete();
    }
}
