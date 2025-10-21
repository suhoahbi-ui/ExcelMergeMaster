import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { parseExcelFile, mergeExcelData } from "./excelProcessor";
import { storage } from "./storage";
import { insertSavedMergedFileSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Excel 파일만 업로드 가능합니다.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/merge-excel', (req, res, next) => {
    upload.fields([
      { name: 'dispatchFiles', maxCount: 20 },
      { name: 'salesFiles', maxCount: 1 }
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          error: err.code === 'LIMIT_FILE_SIZE' 
            ? '파일 크기는 10MB를 초과할 수 없습니다.'
            : err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message || 'Excel 파일만 업로드 가능합니다.'
        });
      }
      next();
    });
  }, (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files?.dispatchFiles || !files?.salesFiles) {
        return res.status(400).json({ 
          success: false,
          error: '배차내역 파일과 매출리스트 파일을 모두 업로드해주세요.' 
        });
      }

      const dispatchFilesData = files.dispatchFiles.map(file => 
        parseExcelFile(file.buffer)
      );
      
      const salesFileData = parseExcelFile(files.salesFiles[0].buffer);
      
      const result = mergeExcelData(dispatchFilesData, salesFileData);
      
      res.json(result);
    } catch (error) {
      console.error('Excel merge error:', error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.' 
      });
    }
  });

  app.post('/api/saved-files', async (req, res) => {
    try {
      const validatedData = insertSavedMergedFileSchema.parse(req.body);
      const savedFile = await storage.saveMergedFile(validatedData);
      res.json(savedFile);
    } catch (error) {
      console.error('Save file error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : '파일 저장 중 오류가 발생했습니다.' 
      });
    }
  });

  app.get('/api/saved-files', async (req, res) => {
    try {
      const files = await storage.getSavedFiles();
      res.json(files);
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : '파일 목록 조회 중 오류가 발생했습니다.' 
      });
    }
  });

  app.get('/api/saved-files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: '유효하지 않은 파일 ID입니다.' });
      }
      
      const file = await storage.getSavedFileById(id);
      if (!file) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
      }
      
      res.json(file);
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : '파일 조회 중 오류가 발생했습니다.' 
      });
    }
  });

  app.delete('/api/saved-files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: '유효하지 않은 파일 ID입니다.' });
      }
      
      await storage.deleteSavedFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : '파일 삭제 중 오류가 발생했습니다.' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
