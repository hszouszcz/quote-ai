import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { DiscovryTextArea } from "./DiscoveryTextArea";

interface DiscoveryInputProps {
  onSubmit?: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

const DiscoveryInput = ({
  onSubmit,
  maxLength = 10000,
  placeholder = "Start describing your project...",
}: DiscoveryInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && onSubmit) {
      onSubmit(trimmedValue);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  };

  const isDisabled = !value.trim();

  return (
    <div>
      <div className={cn("rounded-md border gap-y-1 p-2")}>
        <DiscovryTextArea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
        />
        <div className="flex justify-end pt-1">
          <Button className="justify-flex-end" onClick={handleSubmit} disabled={isDisabled} aria-label="Submit">
            <PaperPlaneIcon />
          </Button>
        </div>
      </div>
      <div>
        {value.length}/{maxLength}
      </div>
    </div>
  );
};

export default DiscoveryInput;
