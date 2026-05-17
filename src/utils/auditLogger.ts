import { prisma } from "../db.js";

export interface AuditLogData {
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "LOGIN" | "LOGOUT" | "FAILED_LOGIN";
  entity: string;
  entityId?: string;
  performedBy?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export async function logAction(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        performedBy: data.performedBy,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
      },
    });
    console.log("[AUDIT LOG] Created:", data.action, data.entity);
  } catch (error) {
    console.error("[AUDIT LOG ERROR]", error);
    // Don't throw - audit logging should not break the main operation
  }
}

// Middleware to extract user info from request
export function getAuditContext(req: any): Partial<AuditLogData> {
  return {
    performedBy: req.user?.userId || req.user?.user_id,
    ipAddress: req.ip || req.connection?.remoteAddress,
  };
}