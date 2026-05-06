import { Request, Response } from "express";
import * as service from "../../../services/availabilityServices.js";

export async function getByStaffId(req: Request, res: Response) {
  try {
    const staffId = req.params.staffId as string;
    const data = await service.getByStaffId(staffId);
    if (!data) return res.status(404).json({ message: "Availability not found" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function upsert(req: Request, res: Response) {
  try {
    const staffId = req.params.staffId as string;
    const data = await service.upsert(staffId, req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const staffId = req.params.staffId as string;
    await service.removeByStaffId(staffId);
    res.json({ message: "Availability removed" });
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}