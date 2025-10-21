import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { parseExcelFile, mergeExcelData } from "./excelProcessor";

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

  const httpServer = createServer(app);

  return httpServer;
}
