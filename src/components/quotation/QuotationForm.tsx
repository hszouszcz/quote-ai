import { useState } from "react";
import type { CreateQuotationCommand } from "@/types";
import { ProjectDescriptionInput } from "./ProjectDescriptionInput";
import { PlatformSelection } from "./PlatformSelection";
import { EstimationTypeSelector } from "./EstimationTypeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuotationFormState extends CreateQuotationCommand {
  errors: {
    scope?: string;
    platforms?: string;
    estimation_type?: string;
    submit?: string;
  };
  isSubmitting: boolean;
}

export function QuotationForm() {
  const [formState, setFormState] = useState<QuotationFormState>({
    scope: "",
    platforms: [],
    estimation_type: "Fixed Price",
    errors: {},
    isSubmitting: false,
  });

  const handleDescriptionChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      scope: value,
      errors: {
        ...prev.errors,
        scope: value.length > 10000 ? "Description cannot exceed 10,000 characters" : undefined,
      },
    }));
  };

  const handlePlatformsChange = (platforms: string[]) => {
    setFormState((prev) => ({
      ...prev,
      platforms,
      errors: {
        ...prev.errors,
        platforms: undefined,
      },
    }));
  };

  const handleEstimationTypeChange = (type: "Fixed Price" | "Time & Material") => {
    setFormState((prev) => ({
      ...prev,
      estimation_type: type,
      errors: {
        ...prev.errors,
        estimation_type: undefined,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: QuotationFormState["errors"] = {};

    if (!formState.scope.trim()) {
      errors.scope = "Project description is required";
    }
    if (formState.platforms.length === 0) {
      errors.platforms = "At least one platform must be selected";
    }

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: formState.scope,
          platforms: formState.platforms,
          estimation_type: formState.estimation_type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create quotation");
      }

      // Handle successful submission
      const data = await response.json();
      // window.location.href = `/quotes/${data.id}`;
    } catch (_error) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          submit: "Failed to create quotation. Please try again.",
        },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProjectDescriptionInput
            value={formState.scope}
            onChange={handleDescriptionChange}
            error={formState.errors.scope}
          />

          <PlatformSelection
            selectedPlatforms={formState.platforms}
            onChange={handlePlatformsChange}
            error={formState.errors.platforms}
          />

          <EstimationTypeSelector
            value={formState.estimation_type}
            onChange={handleEstimationTypeChange}
            error={formState.errors.estimation_type}
          />

          {formState.errors.submit && <p className="text-sm text-red-500">{formState.errors.submit}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Creating..." : "Create Quotation"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
