import { cn } from "@/lib/utils";
import { useDiscovery } from "./Discovery";
import { MessageList } from "./MessageList";

const ConversationWindow = ({ className }: { className?: string }) => {
  const { messages, isLoading, error, session } = useDiscovery();

  if (isLoading && !session) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto border rounded-lg p-8", className)}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto border rounded-lg p-4", className)}>
        <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto border rounded-lg", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Discovery Conversation</h2>
        {session && (
          <div className="text-sm text-muted-foreground mt-1">
            Round {session.currentRound} •
            {session.completenessScore !== undefined && <> {session.completenessScore}% complete</>}
          </div>
        )}
      </div>
      <div className="p-4">
        <MessageList messages={messages} />
      </div>
    </div>
  );
};

export { ConversationWindow };
