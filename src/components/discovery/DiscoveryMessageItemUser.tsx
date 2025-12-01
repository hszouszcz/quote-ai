import { cn } from "@/lib/utils";

interface DiscoveryMessageItemUserProps {
  content: string;
}

export const DiscoveryMessageItemUser = ({ content }: DiscoveryMessageItemUserProps) => {
  return (
    <div className={cn(["border, rounded-xl, flex items-right, justify-right"])}>
      <p>{content}</p>
    </div>
  );
};
