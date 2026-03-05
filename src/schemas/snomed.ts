import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** SNOMED concept result */
export const SnomedConceptSchema = z.object({
	concept_id: z.string(),
	fsn: z.string().optional(),
	preferred_term: z.string().optional(),
	semantic_tag: z.string().optional(),
	definition_status: z.string().optional(),
	effective_time: z.string().optional(),
	active: z.boolean().optional(),
	module_id: z.string().optional(),
	similarity: z.number().optional(),
	rrf_score: z.number().optional(),
	text_score: z.number().optional(),
	match_type: z.string().optional(),
	icd10_codes: z.array(z.string()).optional(),
});

/** ICD-10 mapping result */
export const Icd10MappingSchema = z.object({
	icd10_code: z.string(),
	icd10_term: z.string().optional(),
	map_category: z.string().optional(),
	map_priority: z.number().optional(),
	map_rule: z.string().optional(),
	map_advice: z.string().optional(),
	map_target: z.string().optional(),
	correlation_id: z.string().optional(),
});

/** SNOMED relationship */
export const SnomedRelationshipSchema = z.object({
	relationship_id: z.string().optional(),
	source_id: z.string(),
	destination_id: z.string(),
	relationship_type_id: z.string(),
	relationship_type_name: z.string().optional(),
	destination_term: z.string().optional(),
	characteristic_type: z.string().optional(),
	active: z.boolean().optional(),
});

// =============================================================================
// Output Schemas (used by public API)
// =============================================================================

/** search_hybrid output */
export const SearchHybridOutputSchema = z.object({
	query: z.string(),
	count: z.number(),
	results: z.array(SnomedConceptSchema),
	search_mode: z.literal("hybrid"),
	vector_weight: z.number().optional(),
});

/** lookup_code output */
export const LookupCodeOutputSchema = z.object({
	concept: SnomedConceptSchema.nullable(),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type SnomedConcept = z.infer<typeof SnomedConceptSchema>;
export type Icd10Mapping = z.infer<typeof Icd10MappingSchema>;
export type SnomedRelationship = z.infer<typeof SnomedRelationshipSchema>;

export type SnomedSearchOutput = z.infer<typeof SearchHybridOutputSchema>;
export type SnomedLookupOutput = z.infer<typeof LookupCodeOutputSchema>;
