import { Request, Response } from "express";
import * as patientClient from "../../../clients/patientClient.js";

/** GET /api/v1/patient-proxy/appointments */
export async function getAppointments(req: Request, res: Response) {
  try {
    const { status, page, limit } = req.query;

    const data = await patientClient.getAppointments({
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.json(data);
  } catch (e) {
    console.error("[PMS Proxy] getAppointments error:", e);
    res.status(502).json({
      message: e instanceof Error ? e.message : "Failed to fetch appointments from Patient Management",
    });
  }
}

/** GET /api/v1/patient-proxy/patients/:patientId/appointments */
export async function getPatientAppointments(req: Request, res: Response) {
  try {
    const patientId = req.params.patientId as string;
    const data = await patientClient.getPatientAppointments(patientId);
    res.json(data);
  } catch (e) {
    console.error("[PMS Proxy] getPatientAppointments error:", e);
    res.status(502).json({
      message: e instanceof Error ? e.message : "Failed to fetch patient appointments",
    });
  }
}

/** GET /api/v1/patient-proxy/health-records */
export async function getHealthRecords(req: Request, res: Response) {
  try {
    const data = await patientClient.getHealthRecords();
    res.json(data);
  } catch (e) {
    console.error("[PMS Proxy] getHealthRecords error:", e);
    res.status(502).json({
      message: e instanceof Error ? e.message : "Failed to fetch health records",
    });
  }
}

/** GET /api/v1/patient-proxy/health-records/:recordId */
export async function getHealthRecord(req: Request, res: Response) {
  try {
    const recordId= req.params.recordId as string;
    const data = await patientClient.getHealthRecord(recordId);
    res.json(data);
  } catch (e) {
    console.error("[PMS Proxy] getHealthRecord error:", e);
    res.status(502).json({
      message: e instanceof Error ? e.message : "Failed to fetch health record",
    });
  }
}