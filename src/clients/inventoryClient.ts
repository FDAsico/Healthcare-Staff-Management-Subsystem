import "dotenv/config";

const BASE_URL = (process.env.INVENTORY_SUB_BASE_URL || "").trim().replace(/\/$/, "");
const API_KEY = (process.env.INVENTORY_SUB_API_KEY || "").trim();

function getBaseUrl(): string {
  if (!BASE_URL) throw new Error("INVENTORY_BASE_URL not set in .env");
  return BASE_URL;
}

function getApiKey(): string {
  if (!API_KEY) throw new Error("INVENTORY_API_KEY not set in .env");
  return API_KEY;
}

/** Get all inventory items */
export async function getInventory() {
  const url = `${getBaseUrl()}/inventory`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`Inventory fetch failed: ${res.status} - ${text.substring(0, 200)}`);
  }

  return res.json();
}