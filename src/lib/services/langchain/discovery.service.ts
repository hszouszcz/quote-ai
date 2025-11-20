import {
  DiscoveryInitialDataSchema,
  InitialProjectAnalysisResponseSchema,
  PartialAnalysisCompletionResponseSchema,
  QuestionsRoundResponseSchema,
  type DiscoveryInitialData,
} from "@/lib/schemas";
import type { SupabaseClient } from "@/db/supabase.client";
import type { Database } from "@/types/database.types";
import z from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  buildCompletnessAnalysisHumanPrompt,
  buildInitialQuestionPrompt,
  COMPLETENESS_ANALYSIS_SYSTEM_PROMPT,
  DISCOVERY__GENERATE_QUESTIONS_SYSTEM_PROMPT,
  PROJECT_DISCOVERY_INITIAL_ANALYSIS_SYSTEM_PROMPT,
} from "./prompts";
import formatQA from "@/lib/utils/formatQA";

const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = import.meta.env.OPENROUTER_BASE_URL;
const PROJECT_ANALYSIS_MODEL = import.meta.env.PROJECT_ANALYSIS_MODEL;

// 👉 1. Wyciągamy typy z wygenerowanego Database type
type DiscoverySessionRow = Database["public"]["Tables"]["discovery_sessions"]["Row"];
type DiscoverySessionInsert = Database["public"]["Tables"]["discovery_sessions"]["Insert"];
type DiscoverySessionUpdate = Database["public"]["Tables"]["discovery_sessions"]["Update"];

type DiscoveryQuestionsForRoundRow = Database["public"]["Tables"]["discovery_questions"]["Row"];
type DiscoveryQuestionsForRoundInsert = Database["public"]["Tables"]["discovery_questions"]["Insert"];
type DiscoveryQuestionsForRoundUpdate = Database["public"]["Tables"]["discovery_questions"]["Update"];

type DiscoveryConversationLogInsert = Database["public"]["Tables"]["discovery_conversation_log"]["Insert"];

export class DiscoveryService {
  // 👉 2. Constructor używa typowanego klienta z naszego projektu
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {
    this.agent = new ChatOpenAI({
      model: PROJECT_ANALYSIS_MODEL,
      apiKey: OPENROUTER_API_KEY,
      temperature: 0.5,
      maxTokens: 4000,
      configuration: {
        baseURL: OPENROUTER_BASE_URL,
        // defaultHeaders: {
        //   "HTTP-Referer": "https://quote-ai.app",
        //   "X-Title": "QuoteAI App",
        // },
      },
    });
  }
  private agent: ChatOpenAI;

  // 👉 4. Metoda zwraca typowany wynik
  async startDiscovery(initialData: DiscoveryInitialData): Promise<DiscoverySessionRow> {
    try {
      const validatedData = DiscoveryInitialDataSchema.parse(initialData);

      // 👉 5. Typy insert są automatycznie walidowane przez TypeScript
      const insertData: DiscoverySessionInsert = {
        user_id: this.userId,
        initial_description: validatedData.initialDescription,
        status: "in_progress",
        current_round: 1, // Poprawione z 0 na 1 (zgodnie z CHECK constraint)
      };

      // 👉 6. .insert() zwraca null, użyj .insert().select() aby dostać dane
      const { data: sessionData, error: sessionError } = await this.supabase
        .from("discovery_sessions")
        .insert(insertData)
        .select()
        .single(); // single() zwraca pojedynczy rekord zamiast array

      if (sessionError) {
        throw new Error(`DiscoveryService.startDiscovery Failed to create session: ${sessionError.message}`);
      }

      // 👉 7. sessionData jest teraz typu DiscoverySessionRow (lub null)
      if (!sessionData) {
        throw new Error("DiscoveryService.startDiscovery No data returned from insert");
      }

      return sessionData; // Zwracamy typowany obiekt
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
        throw new Error(`DiscoveryService.startDiscovery Input validation failed: ${errorMessages}`);
      } else {
        throw new Error(`DiscoveryService.startDiscovery Unexpected error: ${error}`);
      }
    }
  }

  async initialAnalysis(sessionId: string, description: string) {
    // TODO: consider retrieving description from db inststead of passing as argument;
    if (!description || !sessionId) {
      throw new Error("DiscoveryService.initialAnalysis Invalid input");
    }
    try {
      const response = await this.agent.invoke(
        [new SystemMessage(PROJECT_DISCOVERY_INITIAL_ANALYSIS_SYSTEM_PROMPT), new HumanMessage(description)],
        { response_format: { type: "json_object" } }
      );

      console.log("Initial Analysis Response:", response.content.toString());

      const rawJson = JSON.parse(response.content.toString());
      const validatedData = InitialProjectAnalysisResponseSchema.parse(rawJson);

      await this.supabase
        .from("discovery_sessions")
        .update({ final_analysis: validatedData })
        .eq("id", sessionId)
        .select()
        .single();

      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
        throw new Error(`DiscoveryService.initialAnalysis Response validation failed: ${errorMessages}`);
      } else {
        throw new Error(`DiscoveryService.initialAnalysis Unexpected error: ${error}`);
      }
    }
  }

  async processAnswers(sessionId: string) {
    const { data, error } = await this.supabase
      .from("discovery_sessions")
      .select(
        `initial_description,
        final_analysis,
        discovery_questions (
          *
        )`
      )
      .eq("id", sessionId)
      .single();
    if (error) {
      throw new Error(`DiscoveryService.processAnswers Failed to retrieve project description: ${error.message}`);
    }

    const projectDescription = data?.initial_description;
    const partialAnalysis = data?.final_analysis || "";
    const questions = data?.discovery_questions;

    const questionsAndAnswers = formatQA(questions || []);

    const completionAnalysisResult = await this.agent.invoke(
      [
        new SystemMessage(COMPLETENESS_ANALYSIS_SYSTEM_PROMPT),
        new HumanMessage(
          buildCompletnessAnalysisHumanPrompt(
            projectDescription.trim(),
            partialAnalysis?.toString().trim(),
            questionsAndAnswers.trim()
          )
        ),
      ],
      {
        response_format: { type: "json_object" },
      }
    );

    try {
      const rawJson = JSON.parse(completionAnalysisResult.toString());

      const validatedResponse = PartialAnalysisCompletionResponseSchema.parse(rawJson);

      console.log(validatedResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
        throw new Error(`DiscoveryService.initialAnalysis Response validation failed: ${errorMessages}`);
      } else {
        throw new Error(`DiscoveryService.initialAnalysis Unexpected error: ${error}`);
      }
    }

    return {};
  }

  // TODO: Implement extractFinalAnalysis
  // async extractFinalAnalysis() {}

  // TODO: Implement evaluateCompleteness
  // async evaluateCompleteness() {}

  // 👉 8. Przykład metody GET z typowaniem
  async getSession(sessionId: string): Promise<DiscoverySessionRow | null> {
    const { data, error } = await this.supabase
      .from("discovery_sessions")
      .select("*") // TypeScript wie jakie kolumny zwrócić
      .eq("id", sessionId)
      .single();

    if (error) {
      throw new Error(`DiscoveryService.getSession Failed: ${error.message}`);
    }

    return data; // data jest typu DiscoverySessionRow | null
  }

  // 👉 9. Przykład metody UPDATE z typowaniem
  async updateSession(sessionId: string, updates: DiscoverySessionUpdate): Promise<DiscoverySessionRow> {
    const { data, error } = await this.supabase
      .from("discovery_sessions")
      .update(updates)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`DiscoveryService.updateSession Failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("DiscoveryService.updateSession No data returned");
    }

    return data;
  }

  async getQuestionsForRound(
    sessionId: string,
    round: number,
    description: string
  ): Promise<DiscoveryQuestionsForRoundRow[]> {
    try {
      const initialAnalysisResponse = await this.initialAnalysis(sessionId, description);
      const result = await this.agent.invoke(
        [
          new SystemMessage(DISCOVERY__GENERATE_QUESTIONS_SYSTEM_PROMPT),
          new HumanMessage(buildInitialQuestionPrompt(description, initialAnalysisResponse.toString())),
        ],
        { response_format: { type: "json_object" } }
      );

      const rawJson = JSON.parse(result.content.toString());
      const validatedData = QuestionsRoundResponseSchema.parse(rawJson);

      const insertData: DiscoveryQuestionsForRoundInsert[] = validatedData.questions.map((q) => ({
        session_id: sessionId,
        round_number: round,
        question_text: q.question,
        context: q.context,
        category: q.category,
        priority: q.priority,
      }));

      const questionsFromDB = await this.supabase.from("discovery_questions").insert(insertData).select();

      //TODO: should I add order field to table? Or timestamp is different for each question?
      const insertQuestionLog: DiscoveryConversationLogInsert[] = validatedData.questions.map((q) => ({
        session_id: sessionId,
        content: q.question,
        role: "agent",
        round_number: round,
      }));

      await this.supabase.from("discovery_conversation_log").insert(insertQuestionLog);

      console.log("Questions for Round Response:", validatedData);

      return questionsFromDB.data || [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
        throw new Error(`DiscoveryService.getQuestionsForRound Response validation failed: ${errorMessages}`);
      } else {
        throw new Error(`DiscoveryService.getQuestionsForRound Unexpected error: ${error}`);
      }
    }
  }

  async saveAnswerToConversationLog(sessionId: string, answer: string, round: number): Promise<void> {
    const insertData: DiscoveryConversationLogInsert = {
      session_id: sessionId,
      content: answer,
      role: "user",
      round_number: round,
    };

    const { error } = await this.supabase.from("discovery_conversation_log").insert(insertData).single();

    if (error) {
      throw new Error(`DiscoveryService.saveAnswerToConversationLog Failed: ${error.message}`);
    }
  }

  async saveAnswerForQuestion(
    sessionId: string,
    questionId: string,
    round: number,
    answer: string
  ): Promise<DiscoveryQuestionsForRoundRow | null> {
    let sanitizedAnswer: string = answer;
    if (answer.trim().length === 0) {
      sanitizedAnswer = "No answer provided.";
    }
    if (answer.length > 2000) {
      sanitizedAnswer = answer.slice(0, 2000) + "...[truncated]";
    }
    const insertData: DiscoveryQuestionsForRoundUpdate = {
      session_id: sessionId,
      round_number: round,
      answer: sanitizedAnswer,
      answered_at: new Date().toISOString(),
    };

    const { data: answerRecord, error } = await this.supabase
      .from("discovery_questions")
      .update(insertData)
      .eq("id", questionId)
      .select()
      .single();

    if (error) {
      throw new Error(`DiscoveryService.saveAnswerToQuestion Failed: ${error.message}`);
    }
    return answerRecord;
  }
}
