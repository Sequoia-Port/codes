/**
 * Rated-Age Engine #14 — SDK schemas.
 *
 * Mirrors the engine's response shape (Tier-1/T2/T3 cited substrate +
 * calculation trace + ASOP attestation + signature hash). Keep in sync
 * with `@repo/codex-api` actions/engines/rated-age/schemas.ts and the
 * Go engine's models/types.go.
 */

import { z } from "zod";

// =============================================================================
// Citation (REQUIRED on every numeric claim)
// =============================================================================

export const CitationSchema = z.object({
	tier_marker: z.enum(["T1", "T2", "T3", "T4", ""]),
	source_name: z.string(),
	source_year: z.number().int(),
	source_identifier: z.string().optional(),
	page_ref: z.string().optional(),
	extracted_at: z.string().optional(),
});

// =============================================================================
// Inputs (matching the engine's ComorbidityInput / MedicationInput / ClaimContext)
// =============================================================================

export const RatedAgeComorbiditySchema = z.object({
	code: z.string().min(1),
	severity: z.string().optional(),
	onset: z.string().optional(),
	claim_id: z.string().optional(),
});

export const RatedAgeMedicationSchema = z.object({
	rxnorm: z.string().optional(),
	ndc: z.string().optional(),
	atc_class: z.string().optional(),
});

export const RatedAgeClaimContextSchema = z.object({
	jurisdiction_state: z.string().optional(),
	accepted_body_systems: z.array(z.string()).optional(),
	date_of_injury: z.string().optional(),
});

// =============================================================================
// propose
// =============================================================================

export const RatedAgeProposeInputSchema = z.object({
	age: z.number().int().min(0).max(125),
	sex: z.enum(["M", "F"]).optional(),
	comorbidities: z.array(RatedAgeComorbiditySchema),
	medications: z.array(RatedAgeMedicationSchema).optional(),
	claim_context: RatedAgeClaimContextSchema.optional(),
	stacking_rule: z
		.enum(["additive_v1", "multiplicative_rank_decay_v2"])
		.optional(),
});

export const RatedAgeContributorSchema = z.object({
	code: z.string(),
	hr: z.number(),
	ci_low: z.number().optional(),
	ci_high: z.number().optional(),
	delta_years: z.number(),
	citation: CitationSchema,
	notes: z.string().optional(),
	body_system_moderation: z.string().optional(),
	needs_expert_review: z.boolean().optional(),
	expert_review_reason: z.string().optional(),
	claim_id: z.string().optional(),
});

export const RatedAgePerClaimBreakdownSchema = z.object({
	claim_id: z.string(),
	delta_years: z.number(),
	contributors: z.array(RatedAgeContributorSchema),
	unique_codes: z.number().int(),
});

export const RatedAgeCalculationStepSchema = z.object({
	step_index: z.number().int(),
	contributor_code: z.string(),
	delta_added: z.number(),
	cumulative_delta: z.number(),
	capped: z.boolean().optional(),
	decay_weight: z.number().optional(),
	hr: z.number().optional(),
	adjusted_hr: z.number().optional(),
	cumulative_joint_hr: z.number().optional(),
	notes: z.string().optional(),
});

export const RatedAgeOverlayScoresSchema = z.object({
	charlson_quan_2005: z.number().int(),
	elixhauser_quan_2009: z.number().int(),
});

export const RatedAgeAlternativeStackingSchema = z.object({
	rule: z.enum(["additive_v1", "multiplicative_rank_decay_v2"]),
	delta_years: z.number(),
	rated_age: z.number().int(),
});

export const RatedAgeASOPAttestationSchema = z.object({
	methodology: z.string(),
	assumptions: z.array(z.string()),
	material_uncertainty: z.string().optional(),
	data_sources: z.array(z.string()),
});

export const RatedAgeProposeOutputSchema = z.object({
	rated_age: z.number().int(),
	delta_years: z.number(),
	contributors: z.array(RatedAgeContributorSchema),
	per_claim_breakdown: z.array(RatedAgePerClaimBreakdownSchema).optional(),
	calculation_trace: z.array(RatedAgeCalculationStepSchema).optional(),
	confidence: z.enum(["high", "medium", "low", "needs_expert_review"]),
	confidence_score: z.number(),
	confidence_categorical_only: z.boolean(),
	recommended_reinsurance_multiplier: z.number(),
	case_signature_hash: z.string(),
	baseline_source: CitationSchema,
	stacking_rule: z.enum(["additive_v1", "multiplicative_rank_decay_v2"]),
	overlay_scores: RatedAgeOverlayScoresSchema.optional(),
	alternative_stacking: RatedAgeAlternativeStackingSchema.optional(),
	overlay_disagreement: z.string().optional(),
	confidence_reason: z.string().optional(),
	asop_attestation: RatedAgeASOPAttestationSchema.optional(),
	body_system_gating_applied: z.boolean().optional(),
});

// =============================================================================
// lookupHazardRatio
// =============================================================================

export const RatedAgeLookupHazardRatioInputSchema = z.object({
	code: z.string().min(1),
	sex: z.string().optional(),
	age_band: z.string().optional(),
	severity: z.string().optional(),
});

export const RatedAgeLookupHazardRatioOutputSchema = z.object({
	hr: z.number(),
	ci_low: z.number().optional(),
	ci_high: z.number().optional(),
	delta_years: z.number(),
	citation: CitationSchema,
	matched: z.boolean(),
});

// =============================================================================
// scoreComorbidity
// =============================================================================

export const RatedAgeScoreComorbidityInputSchema = z.object({
	codes: z.array(z.string()).min(1),
	index: z.enum(["charlson", "elixhauser"]),
});

export const RatedAgeScoreComorbidityOutputSchema = z.object({
	score: z.number().int(),
	category: z.enum(["low", "medium", "high", "very_high"]),
	components: z.array(
		z.object({
			code: z.string(),
			component: z.string(),
			weight: z.number().int(),
		}),
	),
	citation: CitationSchema.optional(),
});

// =============================================================================
// getVersion / health
// =============================================================================

export const RatedAgeGetVersionOutputSchema = z.object({
	hazard_table_version: z.number().int(),
	sources: z.array(
		z.object({
			dataset: z.string(),
			tier: z.string(),
			version: z.string(),
			extracted_at: z.string(),
		}),
	),
	activated_at: z.string(),
});

export const RatedAgeHealthOutputSchema = z.object({
	status: z.string(),
	db_version: z.string().optional(),
	hazard_table_version: z.number().int().optional(),
});

// =============================================================================
// Type exports
// =============================================================================

export type RatedAgeProposeInput = z.infer<typeof RatedAgeProposeInputSchema>;
export type RatedAgeProposeOutput = z.infer<typeof RatedAgeProposeOutputSchema>;
export type RatedAgeLookupHazardRatioInput = z.infer<
	typeof RatedAgeLookupHazardRatioInputSchema
>;
export type RatedAgeLookupHazardRatioOutput = z.infer<
	typeof RatedAgeLookupHazardRatioOutputSchema
>;
export type RatedAgeScoreComorbidityInput = z.infer<
	typeof RatedAgeScoreComorbidityInputSchema
>;
export type RatedAgeScoreComorbidityOutput = z.infer<
	typeof RatedAgeScoreComorbidityOutputSchema
>;
export type RatedAgeGetVersionOutput = z.infer<
	typeof RatedAgeGetVersionOutputSchema
>;
export type RatedAgeHealthOutput = z.infer<typeof RatedAgeHealthOutputSchema>;
export type RatedAgeContributor = z.infer<typeof RatedAgeContributorSchema>;
export type RatedAgeComorbidity = z.infer<typeof RatedAgeComorbiditySchema>;
export type RatedAgeMedication = z.infer<typeof RatedAgeMedicationSchema>;
export type RatedAgeClaimContext = z.infer<typeof RatedAgeClaimContextSchema>;
export type RatedAgeCitation = z.infer<typeof CitationSchema>;
