import { z } from "zod";

// =============================================================================
// Input Schemas
// =============================================================================

export const GetResultInputSchema = z.object({
	request_id: z.string().min(1),
});

// =============================================================================
// Output Schemas
// =============================================================================

/** get_result output */
export const GetResultOutputSchema = z.object({
	request_id: z.string(),
	status: z.enum(["pending", "running", "completed", "failed"]),
	query: z.string().optional(),
	result: z.record(z.unknown()).optional(),
	error: z.string().optional(),
});

/** Engine status record */
export const EngineStatusSchema = z.record(z.enum(["ok", "error", "unknown"]));

/** health output */
export const HealthOutputSchema = z.object({
	status: z.enum(["ok", "degraded"]),
	version: z.string().optional(),
	environment: z.string().optional(),
	engines: EngineStatusSchema.optional(),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type GetResultInput = z.infer<typeof GetResultInputSchema>;
export type GetResultOutput = z.infer<typeof GetResultOutputSchema>;

export type EngineStatus = z.infer<typeof EngineStatusSchema>;
export type HealthOutput = z.infer<typeof HealthOutputSchema>;
