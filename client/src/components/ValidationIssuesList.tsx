import { AlertTriangle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ValidationIssue } from "@shared/schema";

interface ValidationIssuesListProps {
  issues: ValidationIssue[];
}

export function ValidationIssuesList({ issues }: ValidationIssuesListProps) {
  if (!issues || issues.length === 0) {
    return null;
  }

  const errors = issues.filter(issue => issue.type === 'error');
  const warnings = issues.filter(issue => issue.type === 'warning');

  return (
    <Card className="mb-6" data-testid="validation-issues">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          데이터 검증 결과
        </CardTitle>
        <CardDescription>
          {errors.length > 0 && (
            <span className="text-destructive font-medium">
              오류 {errors.length}건
            </span>
          )}
          {errors.length > 0 && warnings.length > 0 && ", "}
          {warnings.length > 0 && (
            <span className="text-yellow-600 dark:text-yellow-500 font-medium">
              경고 {warnings.length}건
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {errors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  오류
                </h4>
                <div className="space-y-2">
                  {errors.map((issue, index) => (
                    <Alert key={`error-${index}`} variant="destructive" data-testid={`alert-error-${index}`}>
                      <AlertDescription className="flex items-start gap-2">
                        <Badge variant="destructive" className="shrink-0" data-testid={`badge-error-type-${index}`}>
                          {issue.category === 'missing_cargo_number' && '화물번호 누락'}
                        </Badge>
                        <span className="text-sm" data-testid={`text-error-message-${index}`}>
                          {issue.message}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  경고
                </h4>
                <div className="space-y-2">
                  {warnings.map((issue, index) => (
                    <Alert key={`warning-${index}`} className="border-yellow-600 dark:border-yellow-500" data-testid={`alert-warning-${index}`}>
                      <AlertDescription className="flex items-start gap-2">
                        <Badge variant="secondary" className="shrink-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" data-testid={`badge-warning-type-${index}`}>
                          {issue.category === 'duplicate_cargo_number' && '중복'}
                          {issue.category === 'missing_required_field' && '필드 누락'}
                        </Badge>
                        <span className="text-sm" data-testid={`text-warning-message-${index}`}>
                          {issue.message}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
