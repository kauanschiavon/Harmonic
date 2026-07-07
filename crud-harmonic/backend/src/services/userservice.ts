import { db } from "../database/connection";
import { UserRepository } from "../repositories/UserRepository";

export class UserService {
  private static repository = new UserRepository();

  /**
   * Exclui um usuário. Toda a limpeza de dados relacionados (reviews,
   * comentários, curtidas, playlists, follows, favoritos, notificações)
   * é feita pelo próprio Postgres via ON DELETE CASCADE — veja
   * migration_cascade_delete.sql. Isso evita bugs de ordenação que a
   * exclusão manual, feita aqui na aplicação, estava sujeita a ter.
   */
  static async deleteUserCascade(userId: number): Promise<void> {
    const user = await UserService.repository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await db("users").where({ id: userId }).delete();
  }
}
