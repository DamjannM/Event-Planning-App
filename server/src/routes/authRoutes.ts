import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import nodemailer from "nodemailer";
import prisma from "../prismaClient";

dotenv.config();
const router = express.Router();

//REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

    const token = jwt.sign({ id: user.id }, secret, {
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
    const user = await prisma.user.findUnique({
      where: {
        email: email 
      }
    })

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
  try{
    const user = await prisma.user.findUnique({
      where: {
        email: email 
      }
    })
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const token = jwt.sign({ id: user.id }, secret, {expiresIn: "1h"})
    const expires = Date.now() + 3600000;
    await prisma.user.update({
      where: { email },
      data: {
      reset_token: token,
      reset_expires: expires,
      },
    });
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
  }catch(err:any){
    console.log(err.message)
    res.sendStatus(503)
  }
});

//reset password endpoint
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
try{
  const record = await prisma.user.findFirst({
    where: {
      reset_token: token,
      reset_expires: {
        gt: Date.now(),
      },
    },
  });
  
  if (!record) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  await prisma.user.update({
    where: { id: record.id },
    data: {
      password: hashedPassword,
      reset_token: null,
      reset_expires: null,
    },
  });
  res.json({ message: "Password has been reset successfully!" });
}catch(err:any){
  console.log(err.message)
  res.sendStatus(503)
}
});

export default router;