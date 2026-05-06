import { Request, Response, NextFunction } from "express";

const VALID_DOC_TYPES = [
  "MEDICAL_LICENSE",
  "BOARD_CERTIFICATION",
  "DEGREE",
  "TRAINING_CERTIFICATE",
  "BACKGROUND_CHECK",
  "ID_PROOF",
  "CONTRACT",
  "INSURANCE",
  "VACCINATION_RECORD",
];

export function validateCreateDocument(req: Request, res: Response, next: NextFunction) {
  const { staff_id, documentType, title } = req.body;
  if (!staff_id) return res.status(400).json({ message: "Staff ID is required" });
  if (!documentType || !VALID_DOC_TYPES.includes(documentType)) {
    return res.status(400).json({ message: "Valid document type is required" });
  }
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }
  next();
}

export function validateUpdateDocument(req: Request, res: Response, next: NextFunction) {
  const { documentType } = req.body;
  if (documentType && !VALID_DOC_TYPES.includes(documentType)) {
    return res.status(400).json({ message: "Invalid document type" });
  }
  next();
}

export default {
  validateCreateDocument,
  validateUpdateDocument,
};