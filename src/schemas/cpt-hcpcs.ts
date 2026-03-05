import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** CPT/HCPCS code result */
export const CPTCodeSchema = z.object({
	code: z.string(),
	code_type: z.enum(["CPT", "HCPCS"]),
	short_description: z.string(),
	long_description: z.string().optional(),
	indications: z.string().optional(),
	category: z.string().optional(),
	specialty: z.string().optional(),
	similarity: z.number().optional(),
	rvu_work: z.number().optional(),
	rvu_pe: z.number().optional(),
	rvu_mp: z.number().optional(),
});

// =============================================================================
// Output Schemas (used by public API)
// =============================================================================

/** search_hybrid output */
export const SearchHybridOutputSchema = z.object({
	query: z.string(),
	count: z.number(),
	results: z.array(CPTCodeSchema),
});

/** get_code output */
export const GetCodeOutputSchema = z.object({
	code: z.string(),
	found: z.boolean(),
	result: CPTCodeSchema.optional(),
});

/** get_cost output */
export const GetCostOutputSchema = z.object({
	cost: z.object({
		code: z.string(),
		rvu_work: z.number(),
		rvu_pe: z.number(),
		rvu_mp: z.number(),
		rvu_total: z.number(),
		conversion_factor: z.number(),
		fee_schedule: z.string(),
		effective_date: z.string().optional(),
	}),
});

/** link_icd10 output */
export const LinkIcd10OutputSchema = z.object({
	code: z.string(),
	code_type: z.string(),
	short_description: z.string(),
	indications: z.string(),
	search_terms: z.array(z.string()),
	_usage: z.string(),
});

/** search_guidelines output (LCD) */
export const SearchGuidelinesOutputSchema = z.object({
	query: z.string(),
	guidelines: z.array(
		z.object({
			lcd_id: z.string(),
			title: z.string(),
			contractor: z.string(),
			effective_date: z.string(),
			summary: z.string().optional(),
		}),
	),
	count: z.number(),
});

/** get_lcd_by_id output */
export const GetLcdByIdOutputSchema = z.object({
	lcd: z.object({
		lcd_id: z.string(),
		title: z.string(),
		contractor: z.string(),
		effective_date: z.string(),
		content: z.string(),
		summary: z.string().optional(),
	}),
	linked_codes: z.array(z.string()),
	codes_count: z.number(),
});

/** search_ncd output */
export const SearchNcdOutputSchema = z.object({
	query: z.string(),
	ncds: z.array(
		z.object({
			ncd_id: z.string(),
			section: z.string(),
			title: z.string(),
			effective_date: z.string(),
			coverage_level: z.number(),
		}),
	),
	count: z.number(),
});

/** get_ncd output */
export const GetNcdOutputSchema = z.object({
	ncd: z.object({
		ncd_id: z.string(),
		section: z.string(),
		title: z.string(),
		effective_date: z.string(),
		coverage_level: z.number(),
		content: z.string(),
	}),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type CPTCode = z.infer<typeof CPTCodeSchema>;

export type CptSearchOutput = z.infer<typeof SearchHybridOutputSchema>;
export type CptGetCodeOutput = z.infer<typeof GetCodeOutputSchema>;
export type CptGetCostOutput = z.infer<typeof GetCostOutputSchema>;
export type CptLinkIcd10Output = z.infer<typeof LinkIcd10OutputSchema>;

export type LcdSearchOutput = z.infer<typeof SearchGuidelinesOutputSchema>;
export type LcdGetOutput = z.infer<typeof GetLcdByIdOutputSchema>;

export type NcdSearchOutput = z.infer<typeof SearchNcdOutputSchema>;
export type NcdGetOutput = z.infer<typeof GetNcdOutputSchema>;
