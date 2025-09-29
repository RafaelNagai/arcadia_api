import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userArcadia?: {
    id: string;
    username?: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "No token, authorization denied." });

    const token = authHeader.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token, authorization denied." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username?: string };
    req.userArcadia = decoded; // Tipo compatível com AuthRequest

    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed." });
  }
};

export const verifySocketToken = (socket: any, next: any) => {
    const token = socket.handshake.headers.token;
    if (!token) return next(new Error('Authentication failed: token not provided.'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username?: string };
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Authentication failed: invalid token.'));
    }
};
