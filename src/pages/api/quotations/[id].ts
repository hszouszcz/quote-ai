import type { APIRoute } from "astro";
// import type { SupabaseClient } from "@supabase/supabase-js";
import { QuotationService } from "../../../lib/services/quotation.service";
import { quotationIdSchema, updateQuotationSchema } from "../../../lib/schemas/quotation.schema";

interface Locals {
  user: { id: string } | null;
  // supabase: SupabaseClient;
  supabase: any;
}

export const prerender = false;

// GET endpoint
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const quotationId = quotationIdSchema.parse(params.id);
    // const userId = (locals as Locals).user?.id;
    const userId = "f0b55955-91b5-4734-a0c1-804e5f4275a6";
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const quotationService = new QuotationService((locals as Locals).supabase);
    const quotation = await quotationService.getQuotationById(quotationId, userId);

    if (!quotation) {
      return new Response(JSON.stringify({ error: "Quotation not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(quotation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/quotations/[id]:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// PUT endpoint
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const quotationId = quotationIdSchema.parse(params.id);
    const userId = (locals as Locals).user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const updateData = updateQuotationSchema.parse(body);

    const quotationService = new QuotationService((locals as Locals).supabase);

    try {
      const updatedQuotation = await quotationService.updateQuotation(quotationId, userId, updateData);
      return new Response(JSON.stringify(updatedQuotation), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Quotation not found") {
        return new Response(JSON.stringify({ error: "Quotation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in PUT /api/quotations/[id]:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Invalid input data", details: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// DELETE endpoint
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const quotationId = quotationIdSchema.parse(params.id);
    // For now, we'll use a mock user ID since we're skipping authentication
    const userId = "mock-user-id";

    const quotationService = new QuotationService((locals as Locals).supabase);

    try {
      await quotationService.deleteQuotation(quotationId, userId);
      return new Response(JSON.stringify({ message: "Quotation deleted successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Quotation not found") {
        return new Response(JSON.stringify({ error: "Quotation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in DELETE /api/quotations/[id]:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Invalid quotation ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
