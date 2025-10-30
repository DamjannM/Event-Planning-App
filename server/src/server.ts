import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import authMiddleware from "./middleware/authMiddleware";
import db from './db'

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

let notified = new Set<number>()
setInterval(() => {
  try{
    const now = Date.now();
    const upcoming = db.prepare(
      "SELECT * FROM events WHERE timestamp BETWEEN ? AND ?"
    ).all(now, now + 10 * 60 * 1000); 
    
    upcoming.forEach(event => {
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
