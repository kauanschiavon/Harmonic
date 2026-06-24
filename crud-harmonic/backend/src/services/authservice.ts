import bcrypt from "bcrypt";
import { registerSchema } from "../schemas/AuthSchema";
import { UserRepository } from "../repositories/UserRepository";
import jwt from "jsonwebtoken";
import { resolve } from "node:dns";

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
      password: hashedPassword,
      role: "user"
    });
     
    const token = jwt.sign(
        {id: user.id,
        role: user.role
        },
        process.env.JWT_SECRET!,
        {expiresIn: "7d"}
        );



    return {user, token};
  }



   static async login(data: any) {

    const { email, password } = data;

    const userRepository = new UserRepository();

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Senha inválida");
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return {
      user,
      token
    };
  }
  static async forgotPassowrd(data:any){
    
  }

  static async resetPassword(data:any){

  }
}