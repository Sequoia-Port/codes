import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** LOINC code result */
export const LoincCodeSchema = z.object({
	loinc_num: z.string(),
	component: z.string().optional(),
	property: z.string().optional(),
	time_aspect: z.string().optional(),
	system: z.string().optional(),
	scale_type: z.string().optional(),
	method_type: z.string().optional(),
	class: z.string().optional(),
	class_type: z.number().optional(),
	order_obs: z.string().optional(),
	long_common_name: z.string().optional(),
	short_name: z.string().optional(),
	display_name: z.string().optional(),
	consumer_name: z.string().optional(),
	common_test_rank: z.number().optional(),
	common_order_rank: z.number().optional(),
	indications: z.string().optional(),
	clinical_phrases: z.string().optional(),
	documentation_keywords: z.string().optional(),
	interpretation_guidance: z.string().optional(),
	related_tests: z.string().optional(),
	specimen_requirements: z.string().optional(),
	test_category: z.string().optional(),
	body_system: z.string().optional(),
	specialty: z.string().optional(),
	mapped_to: z.string().optional(),
	status: z.string().optional(),
	similarity: z.number().optional(),
	rrf_score: z.number().optional(),
	match_type: z.string().optional(),
});

/** Panel member */
export const PanelMemberSchema = z.object({
	member_loinc: z.string(),
	member_name: z.string().optional(),
	sequence: z.number().optional(),
	observation_required: z.string().optional(),
	component: z.string().optional(),
	long_common_name: z.string().optional(),
	class: z.string().optional(),
});

/** Panel info */
export const PanelInfoSchema = z.object({
	panel_loinc: z.string(),
	panel_name: z.string().optional(),
	member_count: z.number().optional(),
	members: z.array(PanelMemberSchema).optional(),
});

// =============================================================================
// Output Schemas (used by public API)
// =============================================================================

/** search_loinc_hybrid output */
export const SearchLoincHybridOutputSchema = z.object({
	query: z.string(),
	mode: z.string(),
	count: z.number(),
	results: z.array(LoincCodeSchema),
	warning: z.string().optional(),
});

/** get_loinc output */
export const GetLoincOutputSchema = z.object({
	loinc_num: z.string(),
	found: z.boolean(),
	result: LoincCodeSchema.optional(),
});

/** get_panel_members output */
export const GetPanelMembersOutputSchema = z.object({
	panel_loinc: z.string(),
	count: z.number(),
	members: z.array(PanelMemberSchema),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type LoincCode = z.infer<typeof LoincCodeSchema>;
export type PanelMember = z.infer<typeof PanelMemberSchema>;
export type PanelInfo = z.infer<typeof PanelInfoSchema>;

export type LoincSearchOutput = z.infer<typeof SearchLoincHybridOutputSchema>;
export type LoincLookupOutput = z.infer<typeof GetLoincOutputSchema>;
export type LoincGetPanelMembersOutput = z.infer<
	typeof GetPanelMembersOutputSchema
>;
