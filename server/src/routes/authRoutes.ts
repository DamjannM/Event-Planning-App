import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from '../db'
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

//REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const insertUser = db.prepare(`INSERT INTO users (email,password) VALUES (?, ?)`)
    const result = insertUser.run(email,hashedPassword)
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

    const token = jwt.sign({ id: result.lastInsertRowid }, secret, {
      expiresIn: "24h",
    });

    res.json({ token });

  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(400).send({ message: "User already exists" });
    }

    console.error(error);
    res.status(503).send({ message: "Something went wrong" });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try{
    const getUser = db.prepare('SELECT * FROM users WHERE email = ?')
    const user= getUser.get(email)
    if (!user){ 
      return res.status(404).send({message: "User not found"})
    }
    
    const passwordIsValid = bcrypt.compareSync(password, String(user.password));
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

    const token = jwt.sign({ id: user.id }, secret, {
      expiresIn: "24h",
    });

    res.json({ token });
  }catch(err:any){
    console.log(err.message)
    res.sendStatus(503)
  }
});

export default router;