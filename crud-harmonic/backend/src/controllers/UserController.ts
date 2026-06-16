import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/authservice";

const repository = new UserRepository();

export class UserController {


    async create(req: Request, res: Response) {
        try {

            const user =
                await AuthService.register(req.body);

            return res.status(201).json(user);

        } catch (error) {

            if (error instanceof Error) {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: "Erro interno do servidor"
            });
        }
    }

    async findAll(req: Request, res: Response) {

        const users = await repository.findAll();

        return res.json(users);
    }


    async update(req: Request, res: Response) {
        const { id } = req.params;

        const newUserData = req.body;

        await repository.update(Number(id), newUserData);
        return res.json({
            message: "Usuário atualizado"
        });
    }
    async login(req: Request, res: Response) {
    try {

        const result =
            await AuthService.login(req.body);

        return res.status(200).json(result);

    } catch (error) {

        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Erro interno"
        });
    }
}
    
    async delete(req: Request, res: Response) {
        const { id } = req.params;

        await repository.delete(Number(id));

        return res.status(200).json({
            message: "Usuário deletado"
        });
    }
}