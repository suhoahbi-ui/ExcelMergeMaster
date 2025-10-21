import { db } from "./db";
import { savedMergedFiles, type InsertSavedMergedFile, type SavedMergedFile } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  saveMergedFile(file: InsertSavedMergedFile): Promise<SavedMergedFile>;
  getSavedFiles(): Promise<SavedMergedFile[]>;
  getSavedFileById(id: number): Promise<SavedMergedFile | undefined>;
  deleteSavedFile(id: number): Promise<void>;
}

export class DbStorage implements IStorage {
  async saveMergedFile(file: InsertSavedMergedFile): Promise<SavedMergedFile> {
    const [result] = await db.insert(savedMergedFiles).values(file).returning();
    return result;
  }

  async getSavedFiles(): Promise<SavedMergedFile[]> {
    return await db.select().from(savedMergedFiles).orderBy(desc(savedMergedFiles.createdAt));
  }

  async getSavedFileById(id: number): Promise<SavedMergedFile | undefined> {
    const [result] = await db.select().from(savedMergedFiles).where(eq(savedMergedFiles.id, id));
    return result;
  }

  async deleteSavedFile(id: number): Promise<void> {
    await db.delete(savedMergedFiles).where(eq(savedMergedFiles.id, id));
  }
}

export const storage = new DbStorage();
