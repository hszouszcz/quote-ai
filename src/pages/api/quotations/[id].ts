import { createQuotationService, QuotationNotFoundError } from "@/lib/services/quotation.service";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { user } = locals;

  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!params.id || params.id.trim() === "") {
    return new Response(JSON.stringify({ error: "Invalid quotation ID" }), {
      status: 400,
    });
  }

  try {
    const quotationService = createQuotationService(locals.supabase);
    const quotation = await quotationService.getQuotationById(params.id, user.id);

    if (!quotation) {
      return new Response(JSON.stringify({ error: "Quotation not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(quotation));
  } catch (error) {
    if (error instanceof QuotationNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 404 });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { user } = locals;

  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!params.id || params.id.trim() === "") {
    return new Response(JSON.stringify({ error: "Invalid quotation ID" }), {
      status: 400,
    });
  }

  try {
    const body = await request.json();
    const quotationService = createQuotationService(locals.supabase);

    const quotation = await quotationService.updateQuotation(params.id, user.id, body);

    if (!quotation) {
      return new Response(JSON.stringify({ error: "Quotation not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(quotation));
  } catch (error) {
    if (error instanceof QuotationNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 404 });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase, user } = locals;
  const quotationService = createQuotationService(locals.supabase);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!params.id) {
    return new Response(JSON.stringify({ error: "Invalid quotation ID" }), {
      status: 400,
    });
  }

  const { data: existingQuotation } = await supabase.from("quotations").select("user_id").eq("id", params.id).single();

  if (!existingQuotation) {
    return new Response(JSON.stringify({ error: "Quotation not found" }), {
      status: 404,
    });
  }

  if (existingQuotation.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const quotationToDelete = await quotationService.getQuotationById(params.id, user.id);

    if (!quotationToDelete) {
      return new Response(JSON.stringify({ error: "Quotation not found" }), {
        status: 404,
      });
    }

    await quotationService.deleteQuotation(params.id, user.id);
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return new Response(JSON.stringify({ error: "Internal server error. Unable to remove quotation." }), {
      status: 500,
    });
  }

  return new Response(null, { status: 204 });
};
