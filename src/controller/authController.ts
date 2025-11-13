import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByMatricula, createUser } from "../models/authModel";
import { UserRole } from "../types/user.types";
import redisClient from "../config/redis";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || 'sid';
const ACCESS_TTL_SECONDS = 60 * 60;

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[COOKIE_NAME!];

    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    const cached = await redisClient.get(`sess:${decoded.userId}`);

    if (!cached || cached !== token) {
      return res.status(401).json({ message: "Token expirado o inválido" });
    }

    const user = await findUserByMatricula(decoded.matricula);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Error fetching user" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    console.log("Register request body:", req.body);

    let { nombre, apellido, matricula, password, rol = "usuario" } = req.body;
    matricula = matricula.toUpperCase();

    if (!nombre || !apellido || !matricula || !password) {
      console.error("Missing required fields:", {
        nombre,
        apellido,
        matricula,
        password: !!password,
      });
      return res.status(400).json({
        success: false,
        message: "Nombre, apellido, matrícula y contraseña son requeridos",
      });
    }

    const existingUser = await findUserByMatricula(matricula);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this matrícula already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await createUser({
      nombre,
      apellido,
      matricula,
      password: hashedPassword,
      rol: rol as UserRole,
    });

    const token = jwt.sign(
      {
        userId: user.id,
        matricula: user.matricula,
        rol: user.rol,
      },
      JWT_SECRET!,
      { expiresIn: ACCESS_TTL_SECONDS }
    );

    await redisClient.set(`sess:${user.id}`, token, { EX: ACCESS_TTL_SECONDS });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { matricula, password } = req.body;
    matricula = matricula.toUpperCase();

    if (!matricula || !password) {
      console.error("Missing credentials:", {
        matricula: !!matricula,
        password: !!password,
      });
      return res.status(400).json({
        success: false,
        message: "Matrícula y contraseña son requeridos",
      });
    }

    const user = await findUserByMatricula(matricula, true);
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        matricula: user.matricula,
        rol: user.rol,
      },
      JWT_SECRET!,
      { expiresIn: ACCESS_TTL_SECONDS }
    );


    // Store token in Redis
    await redisClient.set(`sess:${user.id}`, token, { 
      EX: ACCESS_TTL_SECONDS 
    });

    const { password: _, ...userWithoutPassword } = user;

    // Set HTTP-only cookie
    res.cookie(COOKIE_NAME!, token, {
      httpOnly: true,
      secure: true , // Enable in production with HTTPS
      sameSite: 'none',
      maxAge: ACCESS_TTL_SECONDS * 1000, // milliseconds
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME!];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string };
      await redisClient.del(`sess:${decoded.userId}`);
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    res.clearCookie(COOKIE_NAME!, { 
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }
  return res.json({ success: true, message: 'Logged out successfully' });
};
