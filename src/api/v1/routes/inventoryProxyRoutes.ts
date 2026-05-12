import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import * as controller from "../controllers/inventoryProxyController.js";

const router = Router();
router.use(authenticate);

router.get("/medications", controller.getMedications);

export default router;