import "dotenv/config";

const BASE_URL = (process.env.ADMIN_SUBSYSTEM_URL || "").trim().replace(/\/$/, "");
const SUBSYSTEM_KEY = (process.env.ADMIN_SUBSYSTEM_KEY || "").trim();

if (!BASE_URL) throw new Error("ADMIN_SUBSYSTEM_URL not set in .env");
if (!SUBSYSTEM_KEY) throw new Error("ADMIN_SUBSYSTEM_KEY not set in .env");

export async function subsystemLogin(username: string, password: string) {
  const url = `${BASE_URL}/admin/api/auth/subsystem-login`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Subsystem-Key": SUBSYSTEM_KEY,
    },
    body: JSON.stringify({
      username,
      password,
      subsystem: "Staff",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Error).message || `Admin auth failed: ${res.status}`);
  }

  return res.json() as Promise<{
    accessToken: string;
    user: {
      user_id: string;
      username: string;
      role: string;
      subsystem: string;
      status: string;
    };
  }>;
}

export async function getStaffUsersFromAdmin() {
  // CORRECTED: uses /admin/api/ not /api/
  const url = `${BASE_URL}/admin/api/subsystem/users?subsystem=Staff`;
  
  console.log("[ADMIN FETCH] Fetching:", url);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Subsystem-Key": SUBSYSTEM_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    console.error("[ADMIN FETCH] Failed:", res.status, text.substring(0, 200));
    throw new Error(`Admin fetch failed: ${res.status}`);
  }

  const data = await res.json() as {
    users: Array<{
      user_id: string;
      staff_id: string | null;
      first_name: string;
      last_name: string;
      username: string;
      role_id: number;
      status: string;
      last_login: string | null;
      created_at: string;
      updated_at: string;
      Role: {
        role_id: number;
        name: string;
        subsystem: string;
      };
    }>;
  };

  return data.users;
}

export async function getUserFromAdmin(userId: string) {
  // General user endpoint uses /api/ per Admin PDF
  const url = `${BASE_URL}/api/users/${userId}`;
  
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Subsystem-Key": SUBSYSTEM_KEY,
    },
  });

  if (!res.ok) throw new Error("User not found in Admin subsystem");
  return res.json();
}

export async function patchStaffIdToAdmin(userId: string, staffId: string) {
  const url = `${BASE_URL}/admin/api/subsystem/users/${userId}/staff-id`;
  
  console.log("[ADMIN PATCH] Fetching:", url);

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Subsystem-Key": SUBSYSTEM_KEY,
    },
    body: JSON.stringify({
      staff_id: staffId,
      subsystem: "Staff",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    console.error("[ADMIN PATCH] Failed:", res.status, text.substring(0, 200));
    throw new Error(`Failed to patch staff_id to Admin: ${res.status}`);
  }

  return res.json();
}