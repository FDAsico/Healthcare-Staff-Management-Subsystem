import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import * as controller from "../controllers/patientProxyController.js";

const router = Router();
router.use(authenticate); 

router.get("/appointments", controller.getAppointments);
router.get("/patients/:patientId/appointments", controller.getPatientAppointments);
router.get("/health-records", controller.getHealthRecords);
router.get("/health-records/:recordId", controller.getHealthRecord);

export default router;