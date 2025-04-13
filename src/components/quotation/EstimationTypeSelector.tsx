import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ESTIMATION_TYPES = [
  { id: "Fixed Price", label: "Fixed Price", description: "Set price based on project scope" },
  { id: "Time & Material", label: "Time & Material", description: "Billing based on actual time spent" },
] as const;

type EstimationType = (typeof ESTIMATION_TYPES)[number]["id"];

interface EstimationTypeSelectorProps {
  value: EstimationType;
  onChange: (value: EstimationType) => void;
  error?: string;
}

export function EstimationTypeSelector({ value, onChange, error }: EstimationTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Estimation Type</Label>
        <p className="text-sm text-gray-500 mt-1">Choose how you want to structure the project pricing</p>
      </div>

      <RadioGroup value={value} onValueChange={onChange} className="gap-4">
        {ESTIMATION_TYPES.map((type) => (
          <div key={type.id} className="flex items-start space-x-3">
            <RadioGroupItem value={type.id} id={`estimation-type-${type.id}`} />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={`estimation-type-${type.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type.label}
              </Label>
              <p className="text-sm text-gray-500">{type.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
