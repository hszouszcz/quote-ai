import { z } from "zod";
import { ValidationError } from "../errors/base";

/**
 * Enhanced validation utility that throws proper AppErrors
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.errors[0];
    const field = firstError?.path.join(".") || "unknown";
    const message = firstError?.message || "Validation failed";

    throw new ValidationError(message, field, undefined, {
      allErrors: result.error.errors,
      receivedData: data,
    });
  }

  return result.data;
}

/**
 * Async validation for complex validations
 */
export async function validateDataAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const field = firstError?.path.join(".") || "unknown";
      const message = firstError?.message || "Validation failed";

      throw new ValidationError(message, field, undefined, {
        allErrors: error.errors,
        receivedData: data,
      });
    }
    throw error;
  }
}

/**
 * Validation helper for API requests
 */
export async function validateRequestBody<T>(request: Request, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json();
    return validateData(schema, body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError("Invalid JSON format in request body");
    }
    throw error;
  }
}

/**
 * Validation helper for query parameters
 */
export function validateQueryParams<T>(url: URL, schema: z.ZodSchema<T>): T {
  const params = Object.fromEntries(url.searchParams);
  return validateData(schema, params);
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: z.string().uuid("Invalid UUID format"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  positiveNumber: z.number().positive("Must be a positive number"),
  nonEmptyString: z.string().min(1, "Field cannot be empty"),
  url: z.string().url("Invalid URL format"),

  // Pagination schema
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),

  // Date range schema
  dateRange: z
    .object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    })
    .refine((data) => data.from <= data.to, {
      message: "From date must be before or equal to to date",
      path: ["from"],
    }),
};
