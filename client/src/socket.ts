import { io } from "socket.io-client";

export const socket = io("http://localhost:8080", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});