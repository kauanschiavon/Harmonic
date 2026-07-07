import { db } from "../database/connection";
import { UserRepository } from "../repositories/UserRepository";

export class UserService {
  private static repository = new UserRepository();

  
  static async deleteUserCascade(userId: number): Promise<void> {
    const user = await UserService.repository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await db("users").where({ id: userId }).delete();
  }
}
