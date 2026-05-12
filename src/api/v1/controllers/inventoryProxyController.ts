import { Request, Response } from "express";
import * as inventoryClient from "../../../clients/inventoryClient.js";

/** GET /api/v1/inventory-proxy/medications */
export async function getMedications(req: Request, res: Response) {
  try {
    const data = await inventoryClient.getInventory();
    res.json(data);
  } catch (e) {
    console.error("[Inventory Proxy] getMedications error:", e);
    res.status(502).json({
      message: e instanceof Error ? e.message : "Failed to fetch inventory",
    });
  }
}