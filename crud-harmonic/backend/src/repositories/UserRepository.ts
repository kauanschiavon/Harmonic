import { isAwaitKeyword } from "typescript";
import { db } from "../database/connection";
import { User } from "../models/User";

export class UserRepository {

    

    async create(user: User) {

        await db("users").insert(user);

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

