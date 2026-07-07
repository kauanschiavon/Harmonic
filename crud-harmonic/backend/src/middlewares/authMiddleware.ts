import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "user" | "admin";
      };
    }
  }
}


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role?: "user" | "admin";
    };

    req.user = {
      id: payload.id,
      role: payload.role ?? "user",
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}


export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito a administradores" });
  }

  return next();
}


export function ownerOrAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }

  const targetId = Number(req.params.id);

  if (req.user.role === "admin" || req.user.id === targetId) {
    return next();
  }

  return res.status(403).json({ message: "Você não tem permissão para alterar este recurso" });
}
