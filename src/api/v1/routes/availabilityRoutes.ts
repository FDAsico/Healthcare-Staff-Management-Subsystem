import { Router } from "express";
import * as controller from "../controllers/availabilityControllers.js";
import { validateUpsertAvailability } from "../validators/availabilityValidator.js";
import { validateUUID } from "../validators/commonValidator.js";
import { authenticate, authorize } from "../../../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/:staffId", authorize(["ADMIN", "STAFF"]), validateUUID("staffId"), controller.getByStaffId);
router.put("/:staffId", authorize(["ADMIN"]), validateUUID("staffId"), validateUpsertAvailability, controller.upsert);
router.delete("/:staffId", authorize(["ADMIN"]), validateUUID("staffId"), controller.remove);

export default router;