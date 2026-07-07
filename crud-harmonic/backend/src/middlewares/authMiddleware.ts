import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Estende o tipo Request do Express para incluir os dados do usuário autenticado,
// preenchidos a partir do token JWT.
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

/**
 * Middleware de autenticação.
 * Verifica se o header "Authorization: Bearer <token>" contém um JWT válido.
 * Se válido, popula req.user com { id, role } e segue para a próxima rota.
 * Se ausente ou inválido, responde 401 e interrompe a requisição.
 */
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
      // Tokens antigos podem não ter "role" — assume "user" por segurança (nunca eleva privilégio).
      role: payload.role ?? "user",
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}

/**
 * Middleware de autorização (admin).
 * Deve ser usado SEMPRE depois do authMiddleware na cadeia de middlewares.
 * Bloqueia a requisição com 403 se o usuário autenticado não for admin.
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito a administradores" });
  }

  return next();
}

/**
 * Middleware de autorização (dono do recurso OU admin).
 * Usa o :id da rota e compara com req.user.id. Admins passam sempre.
 * Deve ser usado depois do authMiddleware.
 */
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
