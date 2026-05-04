import { Request, Response } from "express";
import * as service from "../../../services/staffServices.js";

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
    const staff = await service.getById(id);
    if (!staff) return res.status(404).json({ message: "Not found" });
    res.json(staff);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const staff = await service.create(req.body);
    res.status(201).json(staff);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const staff = await service.update(id, req.body);
    res.json(staff);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await service.remove(id);
    res.json({ message: "Terminated" });
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function getSchedules(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const data = await service.getSchedules(id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function createSchedule(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const data = await service.createSchedule(id, req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function getAttendance(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const data = await service.getAttendance(id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function recordAttendance(req: Request, res: Response) {
  try {
    const data = await service.recordAttendance(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function getLeaves(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const data = await service.getLeaves(id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
}

export async function createLeave(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const data = await service.createLeave(id, req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
}