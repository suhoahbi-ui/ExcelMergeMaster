import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MergedRecord } from '@shared/schema';

interface DataPreviewTableProps {
  data: MergedRecord[];
}

export function DataPreviewTable({ data }: DataPreviewTableProps) {
  if (data.length === 0) {
    return null;
  }

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
            7개 항목
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
                  <TableCell>{record.운송료}</TableCell>
                  <TableCell>{record.수수료}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
