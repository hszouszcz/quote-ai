import { useState, useEffect } from "react";
import type { QuotationDTO, QuotationTaskDTO, CreateReviewCommand } from "@/types";
import { QuotationInfo } from "./QuotationInfo";
import { TasksTable } from "./TasksTable";
import { SummarySection } from "./SummarySection";
import { RatingSection } from "./RatingSection";
import { Button } from "@/components/ui/button";

interface DetailedQuotationPageProps {
  quotationId: string;
}

export function DetailedQuotationPage({ quotationId }: DetailedQuotationPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotation, setQuotation] = useState<QuotationDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    async function fetchQuotation() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/quotations/${quotationId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch quotation details");
        }

        const data = await response.json();
        setQuotation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching the quotation");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuotation();
  }, [quotationId]);

  const handleTasksChange = async (updatedTasks: QuotationTaskDTO[]) => {
    if (!quotation) return;

    setHasUnsavedChanges(true);

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: updatedTasks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tasks");
      }

      setQuotation((prev) => (prev ? { ...prev, tasks: updatedTasks } : null));
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to update tasks:", err);
    }
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    try {
      setIsSubmittingRating(true);
      const reviewData: CreateReviewCommand = {
        rating,
        comment: comment || null,
      };

      const response = await fetch(`/api/quotations/${quotationId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Refresh quotation data to get updated review
      const updatedQuotation = await fetch(`/api/quotations/${quotationId}`).then((res) => res.json());
      setQuotation(updatedQuotation);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing && hasUnsavedChanges) {
      const confirmExit = window.confirm("Masz niezapisane zmiany. Czy na pewno chcesz wyjść z trybu edycji?");
      if (!confirmExit) return;
    }
    setIsEditing(!isEditing);
    setHasUnsavedChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="rounded-lg bg-muted p-4">
        <p>Nie znaleziono wyceny</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Szczegóły wyceny</h1>
        <Button variant={isEditing ? "secondary" : "default"} onClick={handleEditToggle}>
          {isEditing ? "Zakończ edycję" : "Edytuj wycenę"}
        </Button>
      </div>

      <QuotationInfo quotation={quotation} />

      <TasksTable tasks={quotation.tasks ?? []} isEditing={isEditing} onTaskChange={handleTasksChange} />

      <SummarySection tasks={quotation.tasks ?? []} buffer={quotation.buffer} />

      <RatingSection
        initialRating={quotation.review?.rating}
        initialComment={quotation.review?.comment ?? ""}
        onRatingSubmit={handleRatingSubmit}
        isSubmitting={isSubmittingRating}
      />
    </div>
  );
}
