import { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { DataPreviewTable } from '@/components/DataPreviewTable';
import { ValidationIssuesList } from '@/components/ValidationIssuesList';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MergedRecord, ValidationIssue } from '@shared/schema';
import * as XLSX from 'xlsx';

export default function Home() {
  const [dispatchFiles, setDispatchFiles] = useState<File[]>([]);
  const [salesFiles, setSalesFiles] = useState<File[]>([]);
  const [mergedData, setMergedData] = useState<MergedRecord[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const processFiles = async () => {
    if (dispatchFiles.length === 0 || salesFiles.length === 0) {
      setError('배차내역 파일과 매출리스트 파일을 모두 업로드해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      dispatchFiles.forEach((file) => formData.append('dispatchFiles', file));
      salesFiles.forEach((file) => formData.append('salesFiles', file));

      const response = await fetch('/api/merge-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 처리 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setMergedData(result.data);
        setValidationIssues(result.validationIssues || []);
        setSuccess(
          `총 ${result.totalRecords || 0}개 레코드 중 ${result.matchedRecords || 0}개가 병합되었습니다.`
        );
        
        const issueCount = result.validationIssues?.length || 0;
        toast({
          title: '병합 완료',
          description: issueCount > 0 
            ? `${result.matchedRecords || 0}개의 데이터가 병합되었습니다. ${issueCount}개의 검증 이슈가 발견되었습니다.`
            : `${result.matchedRecords || 0}개의 데이터가 성공적으로 병합되었습니다.`,
        });
      } else {
        throw new Error(result.error || '데이터 병합에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadExcel = () => {
    if (mergedData.length === 0) {
      toast({
        title: '다운로드 불가',
        description: '다운로드할 데이터가 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(mergedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '통합데이터');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `통합배차내역_${today}.xlsx`);

    toast({
      title: '다운로드 완료',
      description: '엑셀 파일이 다운로드되었습니다.',
    });
  };

  const handleReset = () => {
    setDispatchFiles([]);
    setSalesFiles([]);
    setMergedData([]);
    setValidationIssues([]);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 mb-2">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              엑셀 파일 통합 도구
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              배차내역과 매출리스트 파일을 업로드하면 화물번호를 기준으로 자동 병합하여 
              통합 엑셀 파일을 생성합니다.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-success">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <FileUploadZone
              files={dispatchFiles}
              onFilesChange={setDispatchFiles}
              title="배차내역 파일"
              description="1월~6월 등 여러 개의 배차내역 파일을 업로드하세요"
              stepNumber="1단계"
              multiple
            />

            <FileUploadZone
              files={salesFiles}
              onFilesChange={setSalesFiles}
              title="매출리스트 파일"
              description="25년상반기매출 리스트 파일을 업로드하세요"
              stepNumber="2단계"
              multiple={false}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={processFiles}
              disabled={isProcessing || dispatchFiles.length === 0 || salesFiles.length === 0}
              size="lg"
              className="min-w-48"
              data-testid="button-process"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  파일 병합하기
                </>
              )}
            </Button>

            {mergedData.length > 0 && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                data-testid="button-reset"
              >
                초기화
              </Button>
            )}
          </div>

          {(mergedData.length > 0 || validationIssues.length > 0) && (
            <div className="space-y-6">
              <ValidationIssuesList issues={validationIssues} />
              
              {mergedData.length > 0 && (
                <>
                  <DataPreviewTable data={mergedData} />

                  <div className="flex justify-center">
                    <Button
                      onClick={downloadExcel}
                      size="lg"
                      variant="default"
                      className="min-w-64"
                      data-testid="button-download"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      통합 엑셀 파일 다운로드
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
