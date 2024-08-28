import express from "express";
import {
  deleteUser,
  test,
  updateUser,
} from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", test);
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);

export { router };
