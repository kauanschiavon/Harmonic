import { db } from "../database/connection";
import crypto from "crypto";

export class PasswordresetRepository{

    async create(userId: number){
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now()+ 24 * 60 * 60 * 1000);

        const [created] = await db("password_reset_tokens")
        .insert({
            user_id : userId,
            token,
            expiresAt : expiresAt
        })
        .returning("*");

    return created;
    }
    async findValidToken(token : string){
        return await db("password_reset_tokens")
        .where({token, used : false})
        .andWhere("expiresAt", ">", new Date())
        .first;
    }

    async markAsUsed(id : number){
        return await db("password_reset_tokens")
        .where({id})
        .update({used: true})
    }
}