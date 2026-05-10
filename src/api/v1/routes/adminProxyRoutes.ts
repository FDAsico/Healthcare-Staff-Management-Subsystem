import { Router } from "express";
import { authenticate, authorize } from "../../../middleware/auth.js";
import * as controller from "../controllers/adminProxyController.js";

const router = Router();
router.use(authenticate, authorize(["ADMIN"]));

router.get("/users", controller.listStaffUsers);
router.get("/users/:id", controller.getUser);

export default router;