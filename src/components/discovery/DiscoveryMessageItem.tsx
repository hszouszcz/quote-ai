import React from "react";
import { DiscoveryMessageItemUser } from "./DiscoveryMessageItemUser";

interface DiscoveryMessageItemProps {
  id: string;
  content: string;
  timestamp: Date;
  role: "user" | "assistant" | "system";
  round?: number;
  questionId?: string;
  answerId?: string;
}

const DiscoveryMessageItem = (props: DiscoveryMessageItemProps) => {
  const { content, id, role, timestamp } = props;

  return (
    <div key={id}>
      {role === "user" ? (
        <DiscoveryMessageItemUser content={content} />
      ) : (
        <>
          <p>{content}</p>
          <span>{new Date(timestamp).toLocaleString()}</span>
        </>
      )}
    </div>
  );
};
export const MemoizedDiscoveryMessageItem = React.memo(DiscoveryMessageItem);
