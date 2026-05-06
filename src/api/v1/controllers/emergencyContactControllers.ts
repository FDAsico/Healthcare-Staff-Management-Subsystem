import { Request, Response } from "express";
import * as service from "../../../services/emergencyContactServices.js";

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
    const contact = await service.getById(id);
    if (!contact) return res.status(404).json({ message: "Emergency contact not found" });
    res.json(contact);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const contact = await service.create(req.body);
    res.status(201).json(contact);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const contact = await service.update(id, req.body);
    res.json(contact);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await service.remove(id);
    res.json({ message: "Emergency contact deleted" });
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}