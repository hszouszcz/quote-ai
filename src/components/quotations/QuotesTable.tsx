import { useCallback } from "react";
import type { QuotationDTO } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface QuotesTableProps {
  quotes: QuotationDTO[];
  onSortChange?: (sort: string) => void;
}

export default function QuotesTable({ quotes, onSortChange }: QuotesTableProps) {
  const handleRowClick = useCallback((id: string) => {
    // Using window.location.assign is safer than directly modifying href
    window.location.assign(`/quotations/${id}`);
  }, []);

  const truncateText = (text: string, maxLength = 100) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      const diffDays = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const calculateTotalManDays = (quotation: QuotationDTO): number => {
    // If man_days is already available at the top level
    if ("man_days" in quotation && typeof quotation.man_days === "number") {
      return quotation.man_days;
    }

    // Otherwise calculate from tasks
    if (quotation.tasks && Array.isArray(quotation.tasks)) {
      return quotation.tasks.reduce((total, task) => total + (task.man_days || 0), 0);
    }

    return 0;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => onSortChange?.("created_at:desc")}>
              Created
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSortChange?.("man_days:desc")}>
              Man-days
            </TableHead>
            <TableHead>Buffer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Platforms</TableHead>
            <TableHead>Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow
              key={quote.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(quote.id)}
            >
              <TableCell>{formatDate(quote.created_at)}</TableCell>
              <TableCell>{quote.estimation_type}</TableCell>
              <TableCell>{calculateTotalManDays(quote)}</TableCell>
              <TableCell>{quote.buffer}%</TableCell>
              <TableCell>{truncateText(quote.scope)}</TableCell>
              <TableCell>{quote.platforms.join(", ")}</TableCell>
              <TableCell>{quote.review?.rating ? `${quote.review.rating}/5` : "-"}</TableCell>
            </TableRow>
          ))}
          {quotes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No quotations found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
