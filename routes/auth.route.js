import express from "express";
import {
  google,
  signin,
  signout,
  signup,
} from "../controllers/auth.controllers.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("auth api route.");
});

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signout);

export { router };
