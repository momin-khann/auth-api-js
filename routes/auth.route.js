import express from "express";
import {
  signin,
  signout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyAuth,
} from "../controllers/auth.controllers.js";
import {verifyToken} from "../middlewares/verifyToken.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("auth api route.");
});

router.get("/verify-auth", verifyToken, verifyAuth);

router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.get("/sign-out", signout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export { router };
