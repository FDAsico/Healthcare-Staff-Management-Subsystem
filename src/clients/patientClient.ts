import "dotenv/config";

const BASE_URL = (process.env.PMS_BASE_URL || "").trim().replace(/\/$/, "");
const APPOINTMENTS_KEY = (process.env.PMS_APPOINTMENTS_API_KEY || "").trim();
const HEALTH_RECORDS_KEY = (process.env.PMS_HEALTH_RECORDS_API_KEY || "").trim();

function getBaseUrl(): string {
  if (!BASE_URL) throw new Error("PMS_BASE_URL not set in .env");
  return BASE_URL;
}

function getAppointmentsKey(): string {
  if (!APPOINTMENTS_KEY) throw new Error("PMS_APPOINTMENTS_API_KEY not set in .env");
  return APPOINTMENTS_KEY;
}

function getHealthRecordsKey(): string {
  if (!HEALTH_RECORDS_KEY) throw new Error("PMS_HEALTH_RECORDS_API_KEY not set in .env");
  return HEALTH_RECORDS_KEY;
}

/** ─── APPOINTMENTS (uses appointments API key) ───────────────── */

export async function getAppointments(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const url = `${getBaseUrl()}/appointments?${query.toString()}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getAppointmentsKey(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`PMS appointments failed: ${res.status}`);
  }

  return res.json();
}

export async function getPatientAppointments(patientId: string) {
  const url = `${getBaseUrl()}/patients/${patientId}/appointments`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getAppointmentsKey(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`PMS patient appointments failed: ${res.status}`);
  }

  return res.json();
}

/** ─── HEALTH RECORDS (uses health records API key) ───────────── */

export async function getHealthRecords() {
  const url = `${getBaseUrl()}/health-records`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getHealthRecordsKey(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`PMS health records failed: ${res.status}`);
  }

  return res.json();
}

export async function getHealthRecord(recordId: string) {
  const url = `${getBaseUrl()}/health-records/${recordId}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getHealthRecordsKey(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`PMS health record failed: ${res.status}`);
  }

  return res.json();
}