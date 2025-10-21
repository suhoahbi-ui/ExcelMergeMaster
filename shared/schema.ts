import { z } from "zod";

export const mergedRecordSchema = z.object({
  화물번호: z.string(),
  등록일자: z.string(),
  상차지: z.string(),
  하차지: z.string(),
  고객명: z.string(),
  운송료: z.union([z.string(), z.number()]),
  수수료: z.union([z.string(), z.number()]),
});

export type MergedRecord = z.infer<typeof mergedRecordSchema>;

export interface ExcelProcessResult {
  success: boolean;
  data?: MergedRecord[];
  totalRecords?: number;
  matchedRecords?: number;
  unmatchedRecords?: number;
  error?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}
