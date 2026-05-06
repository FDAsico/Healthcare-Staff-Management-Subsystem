import { Request, Response } from "express";
import * as service from "../../../services/departmentServices.js";

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
    const dept = await service.getById(id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.json(dept);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const dept = await service.create(req.body);
    res.status(201).json(dept);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const dept = await service.update(id, req.body);
    res.json(dept);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await service.remove(id);
    res.json({ message: "Department deleted" });
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}