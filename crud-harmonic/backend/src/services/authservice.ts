import bcrypt from "bcrypt";
import { registerSchema } from "../schemas/AuthSchema";
import { UserRepository } from "../repositories/UserRepository";
import jwt from "jsonwebtoken";
import { resolve } from "node:dns";
import { forgotPasswordSchema, resetPasswordSchema } from "../schemas/PasswordresetSchema";
import { PasswordResetRepository } from "../repositories/PasswordresetRepository";
import { sendResetEmailPassword } from "./emailservice";

export class AuthService {


  static async register(data: any) {

    // validação

    const validatedData = registerSchema.parse(data);
    

    const { username, email, password } = validatedData;

    const userRepository = new UserRepository();
    
    const emailExists =
      await userRepository.findByEmail(email);

    if (emailExists) {
      throw new Error("Email já cadastrado");
    }

    const usernameExists =
      await userRepository.findByUsername(username);

    if (usernameExists) {
      throw new Error("Username já está em uso");
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

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
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return {
      user,
      token
    };
  }
  static async forgotPassword(data:any){
    const {email} = forgotPasswordSchema.parse(data);

    const userRepository = new UserRepository();
    const passwordresetRepository = new PasswordResetRepository();

    const user = await userRepository.findByEmail(email)

    if(!user){
      return {message: "Se o email existir, um link de redefinição foi enviado."}
    };

    const resettoken = await passwordresetRepository.create(user.id);

    await sendResetEmailPassword(user.email, resettoken.token);
  
    return {message: "Se o e-mail existe, um link de redefinição foi enviado"}


  }

  static async resetPassword(data:any){
    const  {token, newPassword} = resetPasswordSchema.parse(data)
    const userRepository = new UserRepository
    const passwordresetRepository = new PasswordResetRepository

    const resetToken = await passwordresetRepository.findValidToken(token);

    if(!resetToken){
      throw new Error("Token inválido ou expirado")   
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);  
  
    await userRepository.update(resetToken.user_id, {
      password:hashedPassword,});

      await passwordresetRepository.markAsUsed(resetToken.id);

      return {message: "Senha redefinida com sucesso"};
  }
}