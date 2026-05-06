import { Request, Response } from "express";
import * as service from "../../../services/documentServices.js";

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
    const doc = await service.getById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const doc = await service.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const doc = await service.update(id, req.body);
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await service.remove(id);
    res.json({ message: "Document deleted" });
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}