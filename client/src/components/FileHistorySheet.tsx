import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, Download, FileSpreadsheet, Calendar, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import type { SavedMergedFile, MergedRecord } from '@shared/schema';

export function FileHistorySheet() {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: savedFiles, isLoading } = useQuery<SavedMergedFile[]>({
    queryKey: ['/api/saved-files'],
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/saved-files/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '파일 삭제에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-files'] });
      toast({
        title: '삭제 완료',
        description: '파일이 성공적으로 삭제되었습니다.',
      });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: '삭제 실패',
        description: error.message || '파일 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  const handleDownload = (file: SavedMergedFile) => {
    try {
      const data = file.data as MergedRecord[];
      
      const wsData = [
        ['화물번호', '등록일자', '상차지', '하차지', '고객명', '운송료', '수수료'],
        ...data.map(row => [
          row.화물번호,
          row.등록일자,
          row.상차지,
          row.하차지,
          row.고객명,
          row.운송료,
          row.수수료,
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '통합데이터');

      const fileName = `${file.name}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: '다운로드 완료',
        description: '엑셀 파일이 다운로드되었습니다.',
      });
    } catch (error) {
      toast({
        title: '다운로드 실패',
        description: '파일 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="lg" data-testid="button-file-history">
            <History className="mr-2 h-5 w-5" />
            저장된 파일 보기
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-xl" data-testid="sheet-file-history">
          <SheetHeader>
            <SheetTitle>저장된 병합 파일</SheetTitle>
            <SheetDescription>
              이전에 저장한 병합 파일을 다운로드하거나 삭제할 수 있습니다.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)] mt-6 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !savedFiles || savedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  저장된 파일이 없습니다.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  병합 후 "병합 파일 저장" 버튼을 눌러 파일을 저장하세요.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedFiles.map((file) => (
                  <Card key={file.id} data-testid={`card-saved-file-${file.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {file.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(file.createdAt), 'PPP p', { locale: ko })}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(file)}
                            data-testid={`button-download-${file.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(file.id)}
                            data-testid={`button-delete-${file.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {file.description && (
                      <CardContent className="pb-3 pt-0">
                        <p className="text-sm text-muted-foreground">
                          {file.description}
                        </p>
                      </CardContent>
                    )}
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" data-testid={`badge-total-${file.id}`}>
                          전체: {file.totalRecords}개
                        </Badge>
                        <Badge variant="default" data-testid={`badge-matched-${file.id}`}>
                          병합: {file.matchedRecords}개
                        </Badge>
                        {file.unmatchedRecords > 0 && (
                          <Badge variant="outline" data-testid={`badge-unmatched-${file.id}`}>
                            미매칭: {file.unmatchedRecords}개
                          </Badge>
                        )}
                      </div>
                      {(() => {
                        const sources = file.sourceFiles;
                        if (sources && Array.isArray(sources) && sources.length > 0) {
                          return (
                            <div className="mt-2 text-xs text-muted-foreground">
                              소스 파일: {(sources as string[]).join(', ')}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>파일 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
