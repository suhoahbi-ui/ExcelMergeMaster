import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MergedRecord } from '@shared/schema';
import { useMemo } from 'react';

interface DataPreviewTableProps {
  data: MergedRecord[];
}

function parseKoreanNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const numStr = String(value).replace(/[,\s]/g, '');
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
}

export function DataPreviewTable({ data }: DataPreviewTableProps) {
  if (data.length === 0) {
    return null;
  }

  const totals = useMemo(() => {
    const feeTotal = data.reduce((sum, record) => sum + parseKoreanNumber(record.운송료), 0);
    const commissionTotal = data.reduce((sum, record) => sum + parseKoreanNumber(record.수수료), 0);
    const grandTotal = data.reduce((sum, record) => sum + parseKoreanNumber(record.합계), 0);
    
    return {
      운송료: feeTotal.toLocaleString('ko-KR'),
      수수료: commissionTotal.toLocaleString('ko-KR'),
      합계: grandTotal.toLocaleString('ko-KR'),
    };
  }, [data]);

  return (
    <Card className="w-full" data-testid="card-preview">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">데이터 미리보기</CardTitle>
          <CardDescription className="text-sm">
            병합된 데이터를 확인하세요
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {data.length}개 행
          </Badge>
          <Badge variant="secondary" className="text-xs">
            8개 항목
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-auto max-h-96 border-t">
          <Table>
            <TableHeader className="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead className="font-semibold whitespace-nowrap">화물번호</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">등록일자</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">상차지</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">하차지</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">고객명</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">운송료</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">수수료</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">합계</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record, index) => (
                <TableRow 
                  key={`${record.화물번호}-${index}`}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                  data-testid={`row-${index}`}
                >
                  <TableCell className="font-medium">{record.화물번호}</TableCell>
                  <TableCell>{record.등록일자}</TableCell>
                  <TableCell>{record.상차지}</TableCell>
                  <TableCell>{record.하차지}</TableCell>
                  <TableCell>{record.고객명}</TableCell>
                  <TableCell className="text-right">{record.운송료}</TableCell>
                  <TableCell className="text-right">{record.수수료}</TableCell>
                  <TableCell className="text-right font-semibold">{record.합계}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="sticky bottom-0 bg-muted">
              <TableRow>
                <TableCell colSpan={5} className="font-semibold">전체 합계</TableCell>
                <TableCell className="text-right font-semibold">{totals.운송료}</TableCell>
                <TableCell className="text-right font-semibold">{totals.수수료}</TableCell>
                <TableCell className="text-right font-semibold">{totals.합계}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
