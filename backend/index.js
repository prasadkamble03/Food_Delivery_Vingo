import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import itemRouter from "./routes/item.routes.js";
import shopRouter from "./routes/shop.routes.js";
import orderRouter from "./routes/order.routes.js";
import { socketHandler } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ✅ FRONTEND origins only */
const allowedOrigins = [
  "http://localhost:5173",
  "https://food-delivery-vingo-woad.vercel.app"
];

/* ✅ Express CORS */
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests like Postman / server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

/* ✅ Socket.IO CORS */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

/* ✅ Health check */
app.get("/", (req, res) => {
  res.send("Vingo Backend is running 🚀");
});

/* ✅ API routes */
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

/* ✅ Socket handler */
socketHandler(io);

/* ✅ Start server */
const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
  await connectDb();
  console.log(`Server started at ${PORT}`);
});
