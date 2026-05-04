import { Router } from "express";
import v1Routes from "../api/v1/routes/index.js";

const router = Router();

router.use("/v1", v1Routes);

// Future: router.use("/v2", v2Routes);

export default router;