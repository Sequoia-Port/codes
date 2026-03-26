import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** Package info nested inside a product */
export const NdcPackageSchema = z.object({
	package_ndc: z.string(),
	package_ndc_11: z.string(),
	description: z.string(),
	marketing_start: z.string().optional(),
	marketing_end: z.string().optional(),
});

/** FDA NDC product result */
export const NdcProductSchema = z.object({
	product_ndc: z.string(),
	product_ndc_11: z.string(),
	generic_name: z.string(),
	brand_name: z.string(),
	labeler_name: z.string(),
	product_type: z.string(),
	dosage_form: z.string(),
	marketing_category: z.string(),
	application_number: z.string(),
	dea_schedule: z.string(),
	active_ingredients: z.string(),
	route: z.array(z.string()).optional(),
	pharm_class: z.array(z.string()).optional(),
	packages: z.array(NdcPackageSchema).optional(),
});

/** Cross-reference result (NDC + RxNorm RXCUI) */
export const NdcCrossRefSchema = z.object({
	product: NdcProductSchema,
	rxcui: z.string().optional(),
});

// =============================================================================
// Output Schemas (used by public API)
// =============================================================================

/** lookup_ndc / ndc_lookup output */
export const NdcLookupOutputSchema = z.object({
	product: NdcProductSchema,
});

/** lookup_ndc_batch output */
export const NdcBatchLookupOutputSchema = z.object({
	results: z.array(
		z.object({
			ndc: z.string(),
			product: NdcProductSchema.nullable(),
		}),
	),
	found: z.number(),
	total: z.number(),
});

/** search_products output */
export const NdcSearchOutputSchema = z.object({
	query: z.string(),
	count: z.number(),
	results: z.array(NdcProductSchema),
});

/** search_fuzzy output */
export const NdcFuzzySearchOutputSchema = z.object({
	query: z.string(),
	count: z.number(),
	results: z.array(
		NdcProductSchema.extend({
			similarity: z.number().optional(),
		}),
	),
});

/** get_product output */
export const NdcGetProductOutputSchema = z.object({
	product: NdcProductSchema,
});

/** get_labeler output */
export const NdcGetLabelerOutputSchema = z.object({
	labeler: z.string(),
	count: z.number(),
	results: z.array(NdcProductSchema),
});

/** get_packages output */
export const NdcGetPackagesOutputSchema = z.object({
	product_ndc: z.string(),
	count: z.number(),
	packages: z.array(NdcPackageSchema),
});

/** crossref_rxcui output */
export const NdcCrossRefOutputSchema = z.object({
	result: NdcCrossRefSchema,
});

/** get_stats output */
export const NdcGetStatsOutputSchema = z.object({
	products: z.number(),
	packages: z.number(),
	labelers: z.number(),
	version: z.string(),
	status: z.string(),
	download_date: z.string().optional(),
});

/** health output */
export const NdcHealthOutputSchema = z.object({
	engine: z.string(),
	version: z.string(),
	database: z.string(),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type NdcPackage = z.infer<typeof NdcPackageSchema>;
export type NdcProduct = z.infer<typeof NdcProductSchema>;
export type NdcCrossRef = z.infer<typeof NdcCrossRefSchema>;

export type NdcLookupOutput = z.infer<typeof NdcLookupOutputSchema>;
export type NdcBatchLookupOutput = z.infer<typeof NdcBatchLookupOutputSchema>;
export type NdcSearchOutput = z.infer<typeof NdcSearchOutputSchema>;
export type NdcFuzzySearchOutput = z.infer<typeof NdcFuzzySearchOutputSchema>;
export type NdcGetProductOutput = z.infer<typeof NdcGetProductOutputSchema>;
export type NdcGetLabelerOutput = z.infer<typeof NdcGetLabelerOutputSchema>;
export type NdcGetPackagesOutput = z.infer<typeof NdcGetPackagesOutputSchema>;
export type NdcCrossRefOutput = z.infer<typeof NdcCrossRefOutputSchema>;
export type NdcGetStatsOutput = z.infer<typeof NdcGetStatsOutputSchema>;
export type NdcHealthOutput = z.infer<typeof NdcHealthOutputSchema>;
