import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mergedRecordSchema = z.object({
  화물번호: z.string(),
  등록일자: z.string(),
  상차지: z.string(),
  하차지: z.string(),
  고객명: z.string(),
  운송료: z.union([z.string(), z.number()]),
  수수료: z.union([z.string(), z.number()]),
  합계: z.union([z.string(), z.number()]),
});

export type MergedRecord = z.infer<typeof mergedRecordSchema>;

export interface ValidationIssue {
  type: 'warning' | 'error';
  category: 'missing_cargo_number' | 'duplicate_cargo_number' | 'missing_required_field' | 'invalid_date_format';
  message: string;
  rowIndex?: number;
  cargoNumber?: string;
  field?: string;
}

export interface ExcelProcessResult {
  success: boolean;
  data?: MergedRecord[];
  totalRecords?: number;
  matchedRecords?: number;
  unmatchedRecords?: number;
  validationIssues?: ValidationIssue[];
  error?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export const savedMergedFiles = pgTable("saved_merged_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  totalRecords: integer("total_records").notNull(),
  matchedRecords: integer("matched_records").notNull(),
  unmatchedRecords: integer("unmatched_records").notNull(),
  data: jsonb("data").notNull(),
  sourceFiles: jsonb("source_files").notNull(),
});

export const insertSavedMergedFileSchema = createInsertSchema(savedMergedFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedMergedFile = z.infer<typeof insertSavedMergedFileSchema>;
export type SavedMergedFile = typeof savedMergedFiles.$inferSelect;
