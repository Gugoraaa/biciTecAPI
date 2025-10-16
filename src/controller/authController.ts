import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByMatricula, createUser } from "../models/userModel";
import { UserRole } from "../types/user.types";

const JWT_SECRET = process.env.JWT_SECRET;

export const me = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};


export const register = async (req: Request, res: Response) => {
    try {
        console.log('Register request body:', req.body); 
        
        let { nombre, apellido, matricula, password, rol = 'usuario' } = req.body;
        matricula = matricula.toUpperCase();    

        if (!nombre || !apellido || !matricula || !password) {
            console.error('Missing required fields:', { nombre, apellido, matricula, password: !!password });
            return res.status(400).json({ 
                success: false,
                message: 'Nombre, apellido, matrícula y contraseña son requeridos' 
            });
        }

        const existingUser = await findUserByMatricula(matricula);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this matrícula already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await createUser({
            nombre,
            apellido,
            matricula,
            password: hashedPassword,
            rol: rol as UserRole
        });

        const token = jwt.sign(
            { 
                userId: user.id, 
                matricula: user.matricula,
                rol: user.rol 
            },
            JWT_SECRET!,
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = user;
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        let { matricula, password } = req.body;
        matricula = matricula.toUpperCase();

        if (!matricula || !password) {
            console.error('Missing credentials:', { matricula: !!matricula, password: !!password });
            return res.status(400).json({ 
                success: false,
                message: 'Matrícula y contraseña son requeridos' 
            });
        }

        const user = await findUserByMatricula(matricula, true);
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                matricula: user.matricula,
                rol: user.rol 
            },
            JWT_SECRET!,
            { expiresIn: '1h' }
        );

        
        const { password: _, ...userWithoutPassword } = user;
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};
