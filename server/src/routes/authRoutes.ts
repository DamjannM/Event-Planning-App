import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from '../db'
import dotenv from 'dotenv';
import nodemailer from "nodemailer";

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
    if (error.code === "ERR_SQLITE_ERROR" && error.message?.includes("UNIQUE constraint failed: users.email")) {
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

//email sender
async function createTestTransporter() {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

//Reset password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign({ id: user.id }, secret, {expiresIn: "1h"})
  const expires = Date.now() + 3600000;
  db.prepare(`UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?`)
    .run(token, expires, email);

  const transporter = await createTestTransporter();
  const resetUrl = `http://localhost:5173/reset-password/${token}`;

  const info = await transporter.sendMail({
    from: '"Event Planner" <no-reply@eventapp.com>',
    to: email,
    subject: "Reset Your Password",
    html: `<h3>Reset Password</h3>
           <p>Click below to reset your password:</p>
           <a href="${resetUrl}">Reset Password</a>
           <p>This link will expire in 1 hour.</p>`,
  });

  res.json({
    message: "Password reset link sent!",
    preview: nodemailer.getTestMessageUrl(info),
  });
});

//reset password endpoint
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const record = db
    .prepare(`SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?`)
    .get(token, Date.now());

  if (!record) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.prepare(`UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?`)
    .run(hashedPassword, record.id);

  res.json({ message: "Password has been reset successfully!" });
});

export default router;