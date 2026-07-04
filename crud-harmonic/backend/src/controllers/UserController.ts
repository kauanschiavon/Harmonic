import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/authservice";

const repository = new UserRepository();

export class UserController {

    // POST /users — cadastro (delega tudo para o AuthService)
    async create(req: Request, res: Response) {
        try {
            const result = await AuthService.register(req.body);
            return res.status(201).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // POST /login
    async login(req: Request, res: Response) {
        try {
            const result = await AuthService.login(req.body);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro interno",
            });
        }
    }

    // GET /users
    async findAll(req: Request, res: Response) {
        const users = await repository.findAll();
        return res.json(users);
    }

    // PATCH /users/:id
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const newUserData = req.body;
        const updated = await repository.update(Number(id), newUserData);
        return res.json(updated);
    }

    // DELETE /users/:id
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        await repository.delete(Number(id));
        return res.status(200).json({ message: "Usuário deletado" });
    }
}
