import { db } from "../database/connection";
import crypto from "crypto";


export interface PasswordResetToken{
    id:number;
    user_id:number;
    token:string;
    expires_at:Date;
    used:boolean;
    created_at:Date;

}
export class PasswordResetRepository{

    async create(userId: number):Promise<PasswordResetToken>{
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now()+ 24 * 60 * 60 * 1000);

        const [created] = await db<PasswordResetToken>("password_reset_tokens")
        .insert({
            user_id : userId,
            token,
            expires_at : expiresAt
        })
        .returning("*");

    return created;
    }
    async findValidToken(token : string):Promise<PasswordResetToken | undefined> {
        return await db<PasswordResetToken>("password_reset_tokens")
        .where({token, used : false})
        .andWhere("expires_at", ">", new Date())
        .first();
    }

    async markAsUsed(id : number){
        return await db("password_reset_tokens")
        .where({id})
        .update({used: true})
    }
}