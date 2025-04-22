import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface QuotesFiltersProps {
  onFilterChange: (filters: { filter?: string; sort?: string }) => void;
}

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest First" },
  { value: "created_at:asc", label: "Oldest First" },
  { value: "man_days:desc", label: "Most Man-days" },
  { value: "man_days:asc", label: "Least Man-days" },
];

export default function QuotesFilters({ onFilterChange }: QuotesFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(() => {
    onFilterChange({ filter: searchQuery });
  }, [searchQuery, onFilterChange]);

  const handleSort = useCallback(
    (value: string) => {
      onFilterChange({ sort: value });
    },
    [onFilterChange]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex gap-2 flex-1">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search quotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Search
        </Button>
      </div>

      <Select onValueChange={handleSort} defaultValue="created_at:desc">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
