import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { MergedRecord, ValidationIssue } from '@shared/schema';

interface SaveFileDialogProps {
  mergedData: MergedRecord[];
  validationIssues: ValidationIssue[];
  totalRecords: number;
  matchedRecords: number;
  unmatchedRecords: number;
  sourceFiles: string[];
}

export function SaveFileDialog({
  mergedData,
  validationIssues,
  totalRecords,
  matchedRecords,
  unmatchedRecords,
  sourceFiles,
}: SaveFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/saved-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || `통합파일_${new Date().toLocaleDateString('ko-KR')}`,
          description: description.trim(),
          totalRecords,
          matchedRecords,
          unmatchedRecords,
          data: mergedData,
          sourceFiles,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '파일 저장에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-files'] });
      toast({
        title: '저장 완료',
        description: '병합된 파일이 성공적으로 저장되었습니다.',
      });
      setOpen(false);
      setName('');
      setDescription('');
    },
    onError: (error: Error) => {
      toast({
        title: '저장 실패',
        description: error.message || '파일 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" data-testid="button-save-file">
          <Save className="mr-2 h-5 w-5" />
          병합 파일 저장
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-save-file">
        <DialogHeader>
          <DialogTitle>병합 파일 저장</DialogTitle>
          <DialogDescription>
            병합된 데이터를 저장하고 나중에 다시 불러올 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">파일 이름</Label>
            <Input
              id="name"
              placeholder={`통합파일_${new Date().toLocaleDateString('ko-KR')}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-file-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택사항)</Label>
            <Textarea
              id="description"
              placeholder="이 병합 파일에 대한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-testid="textarea-file-description"
            />
          </div>
          <div className="rounded-md bg-muted p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">총 레코드:</span>
              <span className="font-medium">{totalRecords}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">병합된 레코드:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {matchedRecords}개
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">미매칭 레코드:</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">
                {unmatchedRecords}개
              </span>
            </div>
            {validationIssues.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">검증 이슈:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {validationIssues.length}개
                </span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saveMutation.isPending}
            data-testid="button-cancel-save"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            data-testid="button-confirm-save"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
