import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: number; 
    }
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
try{

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const { id } = decoded as { id: number };
    req.userId = id;
    next();
  });
}catch(err){
  console.log("Authentication middleware error: ", err)
  return res.status(401).json({message: "Invalid or expired token"})
}
}

export default authMiddleware;
