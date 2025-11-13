import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "../models/authModel";
import redisClient from "../config/redis";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const COOKIE_NAME = process.env.COOKIE_NAME || "sid";

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const token = req.cookies?.[COOKIE_NAME];
  const JWT_SECRET = process.env.JWT_SECRET;
  

  if (!JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "Error de configuración del servidor" });
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "No autorizado - Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const cachedToken = await redisClient.get(`sess:${decoded.userId}`);
    if (!cachedToken || cachedToken !== token) {
      return res.status(401).json({ message: "Sesión expirada o inválida" });
    }

    const userId = Number(decoded.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token inválido" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Sesión expirada" });
    }

    return res.status(500).json({ message: "Error de autenticación" });
  }
};

export default authenticateJWT;
