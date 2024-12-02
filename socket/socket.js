import { Server } from "socket.io";
import ApiError from "../utils/ApiError.js";

export default function initializeSocketSetup(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.accessToken;

    if (token) {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET
      );

      if (!decodedToken) {
        throw new ApiError(
          401,
          "Invalid or expired token for socket connection"
        );
      }
      socket.userId = decodedToken._id;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log("a user connected" + socket.id);
  });

  return io;
}
