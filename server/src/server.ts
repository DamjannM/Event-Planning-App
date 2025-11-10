(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import inviteRoutes from "./routes/inviteRoutes";
import authMiddleware from "./middleware/authMiddleware";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import express from "express";
import prisma from "./prismaClient";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";

const app = express();
app.use(cors());
app.use(express.json());

const nginxReplica = process.env.APP_NAME
console.log(`Request server by ${nginxReplica}`)

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const pubClient = new Redis({
  host: "redis",
  port: 6379,
});
const subClient = pubClient.duplicate();

async function setupSocketAdapter() {
  await Promise.all([
    new Promise<void>((resolve) => pubClient.once("ready", resolve)),
    new Promise<void>((resolve) => subClient.once("ready", resolve)),
  ]);

  io.adapter(createAdapter(pubClient, subClient));
}
setupSocketAdapter().catch((err) => {
  console.error("Redis adapter setup failed:", err);
});

if (process.env.LEADER === "true"){
  let notified = new Set<number>()
  setInterval( async () => {
    try{
      const now = Date.now();
      const upcoming = await prisma.event.findMany({
        where: {
          timestamp: {
            gte: BigInt(now),                  
            lte: BigInt(now + 10 * 60 * 1000)
          },
        },
      }); 
      
      upcoming.forEach((event: { id: number; }) => {
        const id = event.id as number;
        if (!notified.has(id)) {
          console.log('event reminder for event', event)
          io.emit("event_reminder", event);
          notified.add(id);
        }
      });
    }catch( err){
      console.log(`error ${err}`)
    }
  }, 60 * 1000)
}
  
export const notifyAllClients = (eventName: string, data: any) => {
  io.emit(eventName, data);
};

app.get("/", (_, res) => res.json({ message: "Hello from backend" }));
app.use("/auth", authRoutes);
app.use("/invite", inviteRoutes);
app.use("/events", authMiddleware, eventRoutes);

const PORT = parseInt(process.env.PORT||'5000',10);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`${nginxReplica} started on port ${PORT}`);
});
