import * as XLSX from 'xlsx';
import type { MergedRecord, ExcelProcessResult, ValidationIssue } from '@shared/schema';

interface DispatchRecord {
  번호?: string | number;
  등록일자?: string | number;
  운송료?: string | number;
  수수료?: string | number;
  [key: string]: any;
}

interface SalesRecord {
  화물번호?: string | number;
  접수시간?: string | number;
  배차시간?: string | number;
  상차지?: string;
  하차지?: string;
  고객명?: string;
  [key: string]: any;
}

function normalizeValue(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeDate(value: any): string {
  if (!value) return '';
  const dateStr = String(value).trim();
  
  const dateMatch = dateStr.match(/(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  const shortDateMatch = dateStr.match(/(\d{2})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
  if (shortDateMatch) {
    const [, year, month, day] = shortDateMatch;
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateStr;
}

function normalizeNumber(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const numStr = String(value).replace(/[,\s()]/g, '');
  const num = parseFloat(numStr);
  if (isNaN(num)) return String(value).trim();
  return num.toLocaleString('ko-KR');
}

function findColumnKey(obj: any, possibleKeys: string[]): string | undefined {
  for (const key of Object.keys(obj)) {
    const normalizedKey = key.trim().toLowerCase();
    for (const possible of possibleKeys) {
      if (normalizedKey.includes(possible.toLowerCase())) {
        return key;
      }
    }
  }
  return undefined;
}

export function parseExcelFile(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const data = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false,
    defval: ''
  });
  
  return data;
}

function validateMergedData(
  dispatchFilesData: any[][],
  salesFileData: any[],
  dispatchMap: Map<string, DispatchRecord>,
  salesMap: Map<string, SalesRecord>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenCargoNumbers = new Set<string>();
  
  dispatchFilesData.forEach((dispatchData, fileIndex) => {
    dispatchData.forEach((row, rowIndex) => {
      const cargoNumberKey = findColumnKey(row, ['번호', 'number', '화물번호']);
      const cargoNumber = cargoNumberKey ? normalizeValue(row[cargoNumberKey]) : '';
      
      if (!cargoNumber) {
        issues.push({
          type: 'error',
          category: 'missing_cargo_number',
          message: `배차내역 파일 ${fileIndex + 1}의 ${rowIndex + 1}행: 화물번호가 누락되었습니다.`,
          rowIndex,
        });
      } else if (seenCargoNumbers.has(cargoNumber)) {
        issues.push({
          type: 'warning',
          category: 'duplicate_cargo_number',
          message: `중복된 화물번호: ${cargoNumber}`,
          cargoNumber,
          rowIndex,
        });
      } else {
        seenCargoNumbers.add(cargoNumber);
      }
    });
  });
  
  salesFileData.forEach((row, rowIndex) => {
    const cargoNumberKey = findColumnKey(row, ['화물번호', 'number', '번호']);
    const cargoNumber = cargoNumberKey ? normalizeValue(row[cargoNumberKey]) : '';
    
    if (!cargoNumber) {
      issues.push({
        type: 'error',
        category: 'missing_cargo_number',
        message: `매출리스트의 ${rowIndex + 1}행: 화물번호가 누락되었습니다.`,
        rowIndex,
      });
    }
    
    const requiredFields = [
      { keys: ['상차지', 'pickup', 'origin'], name: '상차지' },
      { keys: ['하차지', 'dropoff', 'destination'], name: '하차지' },
      { keys: ['고객명', 'customer', 'name'], name: '고객명' }
    ];
    
    requiredFields.forEach(({ keys, name }) => {
      const key = findColumnKey(row, keys);
      const value = key ? normalizeValue(row[key]) : '';
      if (!value && cargoNumber) {
        issues.push({
          type: 'warning',
          category: 'missing_required_field',
          message: `화물번호 ${cargoNumber}: ${name} 정보가 누락되었습니다.`,
          cargoNumber,
          field: name,
        });
      }
    });
  });
  
  return issues;
}

export function mergeExcelData(
  dispatchFilesData: any[][],
  salesFileData: any[]
): ExcelProcessResult {
  try {
    const dispatchMap = new Map<string, DispatchRecord>();
    
    for (const dispatchData of dispatchFilesData) {
      for (const row of dispatchData) {
        const numberKey = findColumnKey(row, ['번호', 'no', 'number']);
        const dateKey = findColumnKey(row, ['등록일자', '일자', 'date', '날짜']);
        const feeKey = findColumnKey(row, ['운송료', '운송비', 'fee']);
        const commissionKey = findColumnKey(row, ['수수료', 'commission']);
        
        if (!numberKey) continue;
        
        const cargoNumber = normalizeValue(row[numberKey]);
        if (!cargoNumber) continue;
        
        const existing = dispatchMap.get(cargoNumber);
        if (!existing) {
          dispatchMap.set(cargoNumber, {
            번호: cargoNumber,
            등록일자: dateKey ? normalizeValue(row[dateKey]) : '',
            운송료: feeKey ? normalizeValue(row[feeKey]) : '',
            수수료: commissionKey ? normalizeValue(row[commissionKey]) : '',
          });
        }
      }
    }
    
    const salesMap = new Map<string, SalesRecord>();
    for (const row of salesFileData) {
      const numberKey = findColumnKey(row, ['화물번호', '번호', 'no', 'number']);
      const loadKey = findColumnKey(row, ['상차지', '상차', 'loading']);
      const unloadKey = findColumnKey(row, ['하차지', '하차', 'unloading']);
      const customerKey = findColumnKey(row, ['고객명', '고객', 'customer', '회사']);
      const receiveTimeKey = findColumnKey(row, ['접수시간', '접수']);
      const dispatchTimeKey = findColumnKey(row, ['배차시간', '배차']);
      
      if (!numberKey) continue;
      
      const cargoNumber = normalizeValue(row[numberKey]);
      if (!cargoNumber) continue;
      
      salesMap.set(cargoNumber, {
        화물번호: cargoNumber,
        상차지: loadKey ? normalizeValue(row[loadKey]) : '',
        하차지: unloadKey ? normalizeValue(row[unloadKey]) : '',
        고객명: customerKey ? normalizeValue(row[customerKey]) : '',
        접수시간: receiveTimeKey ? normalizeValue(row[receiveTimeKey]) : '',
        배차시간: dispatchTimeKey ? normalizeValue(row[dispatchTimeKey]) : '',
      });
    }
    
    const validationIssues = validateMergedData(dispatchFilesData, salesFileData, dispatchMap, salesMap);
    
    const mergedRecords: MergedRecord[] = [];
    const allCargoNumbers = new Set([
      ...Array.from(dispatchMap.keys()),
      ...Array.from(salesMap.keys()),
    ]);
    
    for (const cargoNumber of Array.from(allCargoNumbers)) {
      const dispatch = dispatchMap.get(cargoNumber);
      const sales = salesMap.get(cargoNumber);
      
      const dateValue = dispatch?.등록일자 || sales?.접수시간 || sales?.배차시간 || '';
      
      mergedRecords.push({
        화물번호: cargoNumber,
        등록일자: normalizeDate(dateValue),
        상차지: sales?.상차지 || '',
        하차지: sales?.하차지 || '',
        고객명: sales?.고객명 || '',
        운송료: normalizeNumber(dispatch?.운송료),
        수수료: normalizeNumber(dispatch?.수수료),
      });
    }
    
    const matchedCount = mergedRecords.filter(
      r => dispatchMap.has(r.화물번호) && salesMap.has(r.화물번호)
    ).length;
    
    return {
      success: true,
      data: mergedRecords,
      totalRecords: allCargoNumbers.size,
      matchedRecords: matchedCount,
      unmatchedRecords: allCargoNumbers.size - matchedCount,
      validationIssues,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '데이터 병합 중 오류가 발생했습니다.',
    };
  }
}
