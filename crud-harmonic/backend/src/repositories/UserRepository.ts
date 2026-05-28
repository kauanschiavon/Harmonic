import { db } from "../../../../../Harmonic/crud-harmonic/backend/src/database/connection";
import { User } from "../../../../../Harmonic/crud-harmonic/backend/src/models/User";

export class UserRepository {

    async create(user: User) {

        await db("users").insert(user);

    }

    async findAll() {

        return await db("users").select("*");

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