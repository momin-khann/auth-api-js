import express, { urlencoded } from "express";
import { router as userRoutes } from "./routes/user.route.js";
import { router as authRoutes } from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

// routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

// Initial Running
app.get("/", (req, res) => {
  res.send("Api is running!!!");
});

export { app };
