import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes"
import authMiddleware from "./middleware/authMiddleware";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from backend" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/events",authMiddleware, eventRoutes);

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`);
});
