import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** RxNorm drug result */
export const RxnormDrugSchema = z.object({
	rxcui: z.string(),
	name: z.string().optional(),
	tty: z.string().optional(),
	suppress: z.string().optional(),
	language: z.string().optional(),
	similarity: z.number().optional(),
});

/** NDC result */
export const NdcResultSchema = z.object({
	ndc: z.string(),
	rxcui: z.string().optional(),
	name: z.string().optional(),
	tty: z.string().optional(),
	status: z.string().optional(),
	source: z.string().optional(),
});

// =============================================================================
// Output Schemas (used by public API)
// =============================================================================

/** search_drug output */
export const SearchDrugOutputSchema = z.object({
	query: z.string(),
	count: z.number(),
	results: z.array(RxnormDrugSchema),
	search_mode: z.literal("text"),
});

/** lookup_ndc output */
export const LookupNdcOutputSchema = z.object({
	query: z.string(),
	count: z.number(),
	results: z.array(NdcResultSchema),
});

/** lookup_rxcui output */
export const LookupRxcuiOutputSchema = z.object({
	rxcui: z.string(),
	result: RxnormDrugSchema.nullable(),
});

/** get_ingredients output */
export const GetIngredientsOutputSchema = z.object({
	rxcui: z.string(),
	count: z.number(),
	results: z.array(RxnormDrugSchema),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type RxnormDrug = z.infer<typeof RxnormDrugSchema>;
export type NdcResult = z.infer<typeof NdcResultSchema>;

export type RxnormSearchOutput = z.infer<typeof SearchDrugOutputSchema>;
export type RxnormLookupNdcOutput = z.infer<typeof LookupNdcOutputSchema>;
export type RxnormLookupRxcuiOutput = z.infer<typeof LookupRxcuiOutputSchema>;
export type RxnormGetIngredientsOutput = z.infer<
	typeof GetIngredientsOutputSchema
>;
