import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const connectedSocket = new Map();

export default function initializeSocketSetup(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.accessToken;

    if (!token) {
      return next(new ApiError(400, "Token is required"));
    }

    jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      (err, decodedToken) => {
        if (err) {
          return next(
            new ApiError(401, "Invalid or expired token for socket connection")
          );
        }
        socket.userId = decodedToken._id;
        console.log(decodedToken);
        next();
      }
    );
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      connectedSocket.set(socket.userId, socket.id);
      console.log(connectedSocket);
      socket.on("disconnect", () => {
        connectedSocket.delete(socket.userId);
        console.log("User disconnected:", socket.userId);
      });
    } else {
      socket.disconnect();
    }
  });

  io.on("disconnect", () => {
    console.log("Socket.IO server disconnected");
    connectedSocket.clear();
  });

  console.log("Socket.IO server initialized");
  return io;
}

export { connectedSocket };
