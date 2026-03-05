import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** ICD-10 code result */
export const Icd10CodeSchema = z.object({
	code: z.string(),
	short_description: z.string().optional(),
	long_description: z.string().optional(),
	chapter: z.string().optional(),
	chapter_description: z.string().optional(),
	block: z.string().optional(),
	block_description: z.string().optional(),
	category: z.string().optional(),
	subcategory: z.string().optional(),
	is_billable: z.boolean().optional(),
	valid_for_submission: z.boolean().optional(),
	similarity: z.number().optional(),
	rrf_score: z.number().optional(),
	text_score: z.number().optional(),
	match_type: z.string().optional(),
});

/** ICD-10 chapter */
export const Icd10ChapterSchema = z.object({
	chapter_code: z.string(),
	chapter_description: z.string(),
	code_range: z.string().optional(),
});

// =============================================================================
// Output Schemas (used by public API)
// =============================================================================

/** search_hybrid output */
export const SearchHybridOutputSchema = z.object({
	query: z.string(),
	count: z.number(),
	results: z.array(Icd10CodeSchema),
	search_mode: z.literal("hybrid"),
	vector_weight: z.number().optional(),
});

/** lookup_code output */
export const LookupCodeOutputSchema = z.object({
	code: z.string(),
	result: Icd10CodeSchema.nullable(),
});

/** get_chapters output */
export const GetChaptersOutputSchema = z.object({
	count: z.number(),
	chapters: z.array(Icd10ChapterSchema),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type Icd10Code = z.infer<typeof Icd10CodeSchema>;
export type Icd10Chapter = z.infer<typeof Icd10ChapterSchema>;

export type Icd10SearchOutput = z.infer<typeof SearchHybridOutputSchema>;
export type Icd10LookupOutput = z.infer<typeof LookupCodeOutputSchema>;
export type Icd10GetChaptersOutput = z.infer<typeof GetChaptersOutputSchema>;
