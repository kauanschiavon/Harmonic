import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";

const repository = new UserRepository();

export class UserController {

    async create(req: Request, res: Response) {

        const user = req.body;

        await repository.create(user);

        return res.status(201).json({
            message: "Usuário criado"
        });
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
    
    async delete(req: Request, res: Response) {
        const { id } = req.params;

        await repository.delete(Number(id));

        return res.status(200).json({
            message: "Usuário deletado"
        });
    }
}