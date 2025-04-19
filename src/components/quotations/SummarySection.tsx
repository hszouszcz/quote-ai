import type { QuotationTaskDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummarySectionProps {
  tasks: QuotationTaskDTO[];
  buffer?: number;
}

export function SummarySection({ tasks, buffer = 30 }: SummarySectionProps) {
  const totalManDays = tasks.reduce((sum, task) => sum + (task.man_days ?? 0), 0);
  const bufferDays = (totalManDays * buffer) / 100;
  const totalWithBuffer = totalManDays + bufferDays;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podsumowanie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Suma MD</p>
              <p className="text-2xl font-semibold">{totalManDays.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bufor ({buffer}%)</p>
              <p className="text-2xl font-semibold">{bufferDays.toFixed(1)}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-muted-foreground mb-1">Łącznie z buforem</p>
            <p className="text-3xl font-bold text-primary">{totalWithBuffer.toFixed(1)} MD</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
