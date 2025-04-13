import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ProjectDescriptionInput({ value, onChange, error }: ProjectDescriptionInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const remainingChars = 10000 - value.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="project-description">Project Description</Label>
      <Textarea
        id="project-description"
        value={value}
        onChange={handleChange}
        placeholder="Describe your project in detail..."
        className={`h-48 resize-none ${error ? "border-red-500" : ""}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "project-description-error" : undefined}
      />
      <div className="flex justify-between text-sm">
        <p className={`${isOverLimit ? "text-red-500" : "text-gray-500"}`}>{remainingChars} characters remaining</p>
        {error && (
          <p id="project-description-error" className="text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
