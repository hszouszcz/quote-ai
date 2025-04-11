import { z } from "zod";
import type { APIRoute } from "astro";
import type { Json } from "../../db/database.types";
import { analyzeProject } from "../../lib/services/ai.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

// Validation schema for the request body
const createQuotationSchema = z.object({
  estimation_type: z.enum(["Fixed Price", "Time & Material"]),
  scope: z.string().max(10000, "Scope description cannot exceed 10000 characters"),
  platforms: z.array(z.string()).min(1, "At least one platform must be selected"),
  dynamic_attributes: z.union([z.record(z.unknown()), z.null()]).optional(),
});

// Apply buffer to total man_days (minimum 30%)
const applyBuffer = (totalManDays: number): number => {
  return Math.ceil(totalManDays * 0.3); // 30% buffer
};

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase } = locals;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createQuotationSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const quotationData = validationResult.data;

    // Get AI estimation and tasks with man_days
    const aiAnalysis = await analyzeProject(
      quotationData.scope,
      quotationData.platforms,
      quotationData.estimation_type,
      quotationData.dynamic_attributes as Json
    );

    // Calculate total man_days and buffer
    const totalManDays = aiAnalysis.tasks.reduce((sum, task) => sum + (task.man_days || 0), 0);
    const buffer = applyBuffer(totalManDays);

    // Create the quotation record
    const { data: quotation, error: insertError } = await supabase
      .from("quotations")
      .insert({
        user_id: DEFAULT_USER_ID,
        estimation_type: quotationData.estimation_type,
        scope: quotationData.scope,
        buffer: buffer,
        dynamic_attributes: {
          ...quotationData.dynamic_attributes,
          ai_reasoning: aiAnalysis.reasoning,
        } as Json,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting quotation:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create quotation" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create quotation_platforms relationships
    const { error: platformsError } = await supabase.from("quotation_platforms").insert(
      quotationData.platforms.map((platformId: string) => ({
        quotation_id: quotation.id,
        platform_id: platformId,
      }))
    );

    if (platformsError) {
      console.error("Error linking platforms:", platformsError);
      // Attempt to rollback the quotation creation
      await supabase.from("quotations").delete().eq("id", quotation.id);

      return new Response(JSON.stringify({ error: "Failed to link platforms" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create tasks from AI analysis with man_days
    const { error: tasksError } = await supabase.from("quotation_tasks").insert(
      aiAnalysis.tasks.map((task) => ({
        quotation_id: quotation.id,
        task_description: task.description,
        man_days: task.man_days,
      }))
    );

    if (tasksError) {
      console.error("Error creating tasks:", tasksError);
      // Tasks creation failed but quotation exists - we can proceed
      // In a production environment, we might want to retry task creation
      // or implement a background job for task generation
    }

    // Return the complete quotation with tasks and platforms
    const { data: completeQuotation, error: fetchError } = await supabase
      .from("quotations")
      .select(
        `
        *,
        quotation_platforms (
          platform_id,
          platforms (
            name
          )
        ),
        quotation_tasks (
          task_description,
          man_days
        )
      `
      )
      .eq("id", quotation.id)
      .single();

    if (fetchError) {
      console.error("Error fetching complete quotation:", fetchError);
      return new Response(JSON.stringify(quotation), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(completeQuotation), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
