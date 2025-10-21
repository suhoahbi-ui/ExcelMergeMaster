import { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { UploadedFile } from '@shared/schema';

interface FileUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  title: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  stepNumber: string;
}

export function FileUploadZone({
  files,
  onFilesChange,
  title,
  description,
  accept = '.xlsx,.xls',
  multiple = true,
  stepNumber,
}: FileUploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.name.match(/\.(xlsx|xls)$/i)
      );

      if (droppedFiles.length > 0) {
        if (multiple) {
          onFilesChange([...files, ...droppedFiles]);
        } else {
          onFilesChange([droppedFiles[0]]);
        }
      }
    },
    [files, onFilesChange, multiple]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
      if (selectedFiles.length > 0) {
        if (multiple) {
          onFilesChange([...files, ...selectedFiles]);
        } else {
          onFilesChange([selectedFiles[0]]);
        }
      }
      e.target.value = '';
    },
    [files, onFilesChange, multiple]
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-semibold">
            {stepNumber}
          </Badge>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'relative min-h-48 rounded-lg border-2 border-dashed transition-colors',
          'flex flex-col items-center justify-center p-6 gap-3',
          'hover-elevate cursor-pointer',
          files.length > 0
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card'
        )}
        data-testid={`upload-zone-${stepNumber}`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          data-testid={`input-file-${stepNumber}`}
        />
        
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">
              파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-muted-foreground">
              .xlsx, .xls 파일만 지원
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            업로드된 파일 ({files.length}개)
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 p-3 rounded-md bg-accent border border-accent-border"
                data-testid={`file-item-${index}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  data-testid={`button-remove-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
