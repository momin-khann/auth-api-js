import express, { urlencoded } from "express";
import { router as userRouter } from "./routes/user.route.js";
import { router as authRoute } from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

// routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRoute);

// Initial Running
app.get("/", (req, res) => {
  res.send("Api is running!!!");
});

export { app };
