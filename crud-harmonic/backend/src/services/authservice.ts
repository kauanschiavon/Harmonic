import bcrypt from "bcrypt";
import { registerSchema } from "../schemas/AuthSchema";
import { UserRepository } from "../repositories/UserRepository";

export class AuthService {
  static async register(data: any) {

    // 1. validação

    const validatedData = registerSchema.parse(data);

    const { username, email, password } = validatedData;

    // 2. email já existe?
    const userRepository = new UserRepository();
    
    const emailExists =
      await userRepository.findByEmail(email);

    if (emailExists) {
      throw new Error("Email já cadastrado");
    }

    // 3. username já existe?
    const usernameExists =
      await userRepository.findByUsername(username);

    if (usernameExists) {
      throw new Error("Username já está em uso");
    }

    // 4. hash da senha
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // 5. cria usuário
    const user = await userRepository.create({
      username,
      email,
      password: hashedPassword
    });

    return user;
  }
}