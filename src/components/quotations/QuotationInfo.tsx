import type { QuotationDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuotationInfoProps {
  quotation: QuotationDTO;
}

export function QuotationInfo({ quotation }: QuotationInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacje o projekcie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Typ wyceny</h3>
          <p className="text-lg">{quotation.estimation_type}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Zakres projektu</h3>
          <p className="text-base whitespace-pre-wrap">{quotation.scope}</p>
        </div>

        {quotation.platforms && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Platformy</h3>
            <div className="flex flex-wrap gap-2">
              {quotation.platforms.map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}

        {quotation.dynamic_attributes && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Dodatkowe atrybuty</h3>
            <pre className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
              {JSON.stringify(quotation.dynamic_attributes, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
