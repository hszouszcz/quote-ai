import type { DiscoveryQuestionsForRoundRow } from "@/types";

export default function formatQA(questions: DiscoveryQuestionsForRoundRow[]): string {
  const formattedQA = questions.map((q) => `q:${q.question_text}\na:${q.answer || "No answer provided"}\n`).join("\n");
  return formattedQA;
}
