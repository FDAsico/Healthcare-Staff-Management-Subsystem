import { Request, Response } from "express";
import * as service from "../../../services/auditLogServices.js";

export async function getAll(req: Request, res: Response) {
  try {
    const data = await service.getAll(req.query);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const log = await service.getById(id);
    if (!log) return res.status(404).json({ message: "Audit log not found" });
    res.json(log);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const log = await service.create(req.body);
    res.status(201).json(log);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await service.remove(id);
    res.json({ message: "Audit log deleted" });
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}