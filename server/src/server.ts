import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import authMiddleware from "./middleware/authMiddleware";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

export const notifyAllClients = (eventName: string, data: any) => {
  io.emit(eventName, data);
};

app.get("/", (_, res) => res.json({ message: "Hello from backend" }));
app.use("/auth", authRoutes);
app.use("/events", authMiddleware, eventRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
