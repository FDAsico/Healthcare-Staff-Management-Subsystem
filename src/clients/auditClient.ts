const ADMIN_SUBSYSTEM_AUDIT_URL =
  process.env.ADMIN_AUDIT_URL ||
  "https://admin-subystem.onrender.com/admin/api/audit/ingest";

const SUBSYSTEM_KEY = process.env.ADMIN_SUBSYSTEM_KEY || "";

export async function sendAuditToAdminSubsystem(data: {
  user_id: string;
  action_type: string;
  details: string;
  ip_addr?: string;
  subsystem?: string;
}): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(ADMIN_SUBSYSTEM_AUDIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Subsystem-Key": SUBSYSTEM_KEY,
      },
      body: JSON.stringify({
        user_id: data.user_id,
        action_type: data.action_type,
        details: data.details,
        ip_addr: data.ip_addr || "unknown",
        subsystem: data.subsystem || "Healthcare Staff Management Subsystem",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        "[AUDIT EXTERNAL ERROR] Failed to send to admin subsystem:",
        response.status,
        await response.text()
      );
      return;
    }

    console.log("[AUDIT EXTERNAL] Sent to admin subsystem:", data.action_type);
  } catch (error) {
    console.error("[AUDIT EXTERNAL ERROR] Failed to send to admin subsystem:", error);
    // Don't throw - external audit logging should not break the main operation
  }
}