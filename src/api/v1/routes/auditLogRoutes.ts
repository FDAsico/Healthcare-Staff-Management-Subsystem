import { Router } from "express";
import * as controller from "../controllers/auditLogControllers.js";
import { validateCreateAuditLog } from "../validators/auditLogValidator.js";
import { validateUUID } from "../validators/commonValidator.js";
import { authenticate, authorize } from "../../../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Admin only
router.get("/", authorize(["ADMIN"]), controller.getAll);
router.get("/:id", authorize(["ADMIN"]), validateUUID("id"), controller.getById);
router.post("/", authorize(["ADMIN"]), validateCreateAuditLog, controller.create);
router.delete("/:id", authorize(["ADMIN"]), validateUUID("id"), controller.remove);

export default router;