import { Router } from "express";
import * as controller from "../controllers/documentControllers.js";
import {
  validateCreateDocument,
  validateUpdateDocument,
} from "../validators/documentValidator.js";
import { validateUUID } from "../validators/commonValidator.js";
import { authenticate, authorize } from "../../../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", authorize(["ADMIN", "STAFF"]), controller.getAll);
router.get("/:id", authorize(["ADMIN", "STAFF"]), validateUUID("id"), controller.getById);
router.post("/", authorize(["ADMIN"]), validateCreateDocument, controller.create);
router.put("/:id", authorize(["ADMIN"]), validateUUID("id"), validateUpdateDocument, controller.update);
router.delete("/:id", authorize(["ADMIN"]), validateUUID("id"), controller.remove);

export default router;