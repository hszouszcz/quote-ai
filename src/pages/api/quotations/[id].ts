import type { APIRoute } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data: quotation, error } = await supabase.from("quotations").select("*").eq("id", params.id).single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (!quotation) {
    return new Response(JSON.stringify({ error: "Quotation not found" }), {
      status: 404,
    });
  }

  if (quotation.user_id !== user.id && !quotation.is_public) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify(quotation));
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json();

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

  const { data: quotation, error } = await supabase
    .from("quotations")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(quotation));
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
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

  const { error } = await supabase.from("quotations").delete().eq("id", params.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(null, { status: 204 });
};
