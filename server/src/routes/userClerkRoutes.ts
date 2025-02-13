import express from "express";
import { updateUser } from "../controller/userClerkController";

const router = express.Router();

router.put("/:userId", updateUser);

export default router;
