import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const AVAILABLE_PLATFORMS = [
  { id: "e7eefa5a-c1d6-4a4f-8081-5c0c92c07908", label: "Frontend" },
  { id: "29f6ef63-1b0c-48a4-9dcc-b79dca990ea0", label: "Backend" },
  { id: "7622d226-f615-4386-b533-20af741e2aea", label: "iOS" },
  { id: "acd09060-0301-44e1-8d8d-1d8c7a3c0f40", label: "Android" },
];

interface PlatformSelectionProps {
  selectedPlatforms: string[];
  onChange: (platforms: string[]) => void;
  error?: string;
}

export function PlatformSelection({ selectedPlatforms, onChange, error }: PlatformSelectionProps) {
  const handlePlatformChange = useCallback(
    (platformId: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedPlatforms, platformId]);
      } else {
        onChange(selectedPlatforms.filter((id) => id !== platformId));
      }
    },
    [selectedPlatforms, onChange]
  );

  return (
    <div className="space-y-4">
      <div>
        <Label>Target Platforms</Label>
        <p className="text-sm text-gray-500 mt-1">Select one or more platforms for your project</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {AVAILABLE_PLATFORMS.map((platform) => (
          <div key={platform.id} className="flex items-center space-x-2">
            <Checkbox
              id={`platform-${platform.id}`}
              checked={selectedPlatforms.includes(platform.id)}
              onCheckedChange={(checked) => handlePlatformChange(platform.id, checked as boolean)}
            />
            <Label
              htmlFor={`platform-${platform.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {platform.label}
            </Label>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
