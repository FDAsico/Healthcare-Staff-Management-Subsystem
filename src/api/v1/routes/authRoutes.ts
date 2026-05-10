import { Router } from "express";
import * as controller from "../controllers/authController.js";
import { authenticate } from "../../../middleware/auth.js";

const router = Router();

router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", authenticate, controller.me);

export default router;