import { z } from "zod";

// =============================================================================
// Input Schemas (for orchestrators)
// =============================================================================

export const DiagnosisToProceduresInputSchema = z.object({
	snomed_id: z.string().optional(),
	icd10_code: z.string().optional(),
	query: z.string().optional(),
});

export const CoverageCheckInputSchema = z.object({
	cpt_code: z.string().min(1),
	icd10_code: z.string().optional(),
});

// =============================================================================
// Output Schemas
// =============================================================================

/** diagnosis_to_procedures output */
export const DiagnosisToProceduresOutputSchema = z.object({
	snomed_id: z.string().optional(),
	icd10_code: z.string().optional(),
	icd10_mappings: z.array(z.record(z.unknown())).optional(),
	procedures: z.array(z.record(z.unknown())).optional(),
});

/** coverage_check output */
export const CoverageCheckOutputSchema = z.object({
	cpt_code: z.string(),
	icd10_code: z.string().optional(),
	lcd: z.record(z.unknown()).optional(),
	has_guidelines: z.boolean(),
	diagnosis_covered: z.boolean().optional(),
});

/** get_categories output */
export const GetCategoriesOutputSchema = z.object({
	snomed_semantic_tags: z.record(z.unknown()).optional(),
	icd10_chapters: z.array(z.record(z.unknown())).optional(),
	cpt_categories: z.array(z.record(z.unknown())).optional(),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type DiagnosisToProceduresInput = z.infer<
	typeof DiagnosisToProceduresInputSchema
>;
export type DiagnosisToProceduresOutput = z.infer<
	typeof DiagnosisToProceduresOutputSchema
>;

export type CoverageCheckInput = z.infer<typeof CoverageCheckInputSchema>;
export type CoverageCheckOutput = z.infer<typeof CoverageCheckOutputSchema>;

export type GetCategoriesOutput = z.infer<typeof GetCategoriesOutputSchema>;
