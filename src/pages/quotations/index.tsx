import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingContainer } from "@/components/ui/loading-spinner";
import { RefreshCw } from "lucide-react";
import QuotesFilters from "@/components/quotations/QuotesFilters";
import QuotesTable from "@/components/quotations/QuotesTable";
import Pagination from "@/components/quotations/Pagination";
import { useQuotations } from "@/hooks/useQuotations";

interface QuotationsListViewProps {
  userId?: string;
}

export default function QuotationsListView({ userId }: QuotationsListViewProps) {
  const { quotes, isLoading, error, setFilters, pagination, retry } = useQuotations(userId);

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotesFilters onFilterChange={(filters: { filter?: string; sort?: string }) => setFilters(filters)} />

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertDescription className="flex items-center justify-between">
                <span>{error.message}</span>
                <Button variant="outline" size="sm" onClick={retry} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <LoadingContainer isLoading={isLoading}>
            <QuotesTable quotes={quotes} onSortChange={(sort: string) => setFilters({ sort })} />

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setFilters({ page })}
              />
            )}
          </LoadingContainer>
        </CardContent>
      </Card>
    </div>
  );
}
