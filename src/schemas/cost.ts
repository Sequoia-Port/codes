import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** Individual tier breakdown (professional + facility + anesthesia) */
const TierBreakdownSchema = z.object({
	professional: z.number(),
	facility: z.number(),
	anesthesia: z.number().optional(),
	total: z.number(),
	source: z.string().optional(),
	method: z.string().optional(),
	multiplier_source: z.string().optional(),
	wcmsa_facility: z.string().optional(),
});

/** Per-CPT line item with all 4 tiers */
const TieredLineItemSchema = z.object({
	cpt_code: z.string(),
	modifier: z.string().optional(),
	quantity: z.number().int(),
	locality: z.string(),

	// Tier 1: Medicare
	medicare_professional: z.number(),
	medicare_facility_pfs: z.number(),
	medicare_facility_drg: z.number().optional(),
	medicare_anesthesia: z.number().optional(),
	medicare_total: z.number(),

	// Tier 2: Commercial
	commercial_professional: z.number(),
	commercial_facility: z.number(),
	commercial_anesthesia: z.number().optional(),
	commercial_total: z.number(),

	// 80th Percentile
	p80_professional: z.number().optional(),
	p80_facility: z.number().optional(),
	p80_anesthesia: z.number().optional(),
	p80_total: z.number().optional(),

	// Tier 3: Billed Charges
	billed_professional: z.number().optional(),
	billed_facility: z.number().optional(),
	billed_anesthesia: z.number().optional(),
	billed_total: z.number().optional(),

	// DRG metadata
	drg_code: z.string().optional(),
	drg_title: z.string().optional(),
	drg_weight: z.number().optional(),

	// Audit trail
	calculation: z.record(z.string(), z.string()).optional(),
});

/** MPFS rate lookup result */
const MPFSRateSchema = z.object({
	cpt_code: z.string(),
	modifier: z.string().optional(),
	locality: z.string(),
	work_rvu: z.number(),
	nonfacility_pe_rvu: z.number(),
	facility_pe_rvu: z.number().optional(),
	mp_rvu: z.number(),
	work_gpci: z.number(),
	pe_gpci: z.number(),
	mp_gpci: z.number(),
	conversion_factor: z.number(),
	professional_allowable: z.number(),
	facility_allowable: z.number().optional(),
});

// =============================================================================
// Output Schemas
// =============================================================================

/** projectCostTiered output */
export const ProjectCostTieredOutputSchema = z.object({
	result: z.object({
		claimant_zip: z.string(),
		cbsa: z.string().optional(),
		state: z.string(),
		locality: z.string(),
		line_items: z.array(TieredLineItemSchema),
		medicare: TierBreakdownSchema,
		commercial: TierBreakdownSchema,
		p80_estimate: TierBreakdownSchema,
		billed_charges: TierBreakdownSchema,
		data_year: z.number().int(),
		conversion_factor: z.number(),
		calculation_date: z.string(),
		data_sources: z.array(z.string()),
		inflation_adjustment: z
			.object({
				rand_data_year: z.number().int(),
				target_year: z.number().int(),
				medical_cpi_factor: z.number(),
				hospital_services_factor: z.number(),
			})
			.optional(),
		commercial_multipliers: z
			.object({
				state: z.string(),
				inpatient_facility: z.number(),
				outpatient_facility: z.number(),
				professional: z.number(),
				overall: z.number(),
			})
			.optional(),
	}),
});

/** projectCost (Medicare-only) output */
export const ProjectCostOutputSchema = z.object({
	result: z.record(z.string(), z.unknown()),
});

/** lookupFacilityFee output */
export const LookupFacilityFeeOutputSchema = z.object({
	result: z.record(z.string(), z.unknown()),
});

/** lookupMPFS output */
export const LookupMPFSOutputSchema = z.object({
	result: MPFSRateSchema.optional(),
});

/** lookupAnesthesia output */
export const LookupAnesthesiaOutputSchema = z.object({
	result: z.record(z.string(), z.unknown()),
});

/** getFacilities output */
export const GetFacilitiesOutputSchema = z.object({
	result: z.record(z.string(), z.unknown()),
});

/** cost health output */
export const CostHealthOutputSchema = z.object({
	status: z.enum(["healthy", "degraded"]),
	engine: z.string().optional(),
	version: z.string().optional(),
});

/** cost stats output */
export const CostGetStatsOutputSchema = z.object({
	stats: z.record(z.string(), z.unknown()),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type TierBreakdown = z.infer<typeof TierBreakdownSchema>;
export type TieredLineItem = z.infer<typeof TieredLineItemSchema>;
export type MPFSRate = z.infer<typeof MPFSRateSchema>;

export type CostProjectTieredOutput = z.infer<
	typeof ProjectCostTieredOutputSchema
>;
export type CostProjectOutput = z.infer<typeof ProjectCostOutputSchema>;
export type CostLookupFacilityFeeOutput = z.infer<
	typeof LookupFacilityFeeOutputSchema
>;
export type CostLookupMPFSOutput = z.infer<typeof LookupMPFSOutputSchema>;
export type CostLookupAnesthesiaOutput = z.infer<
	typeof LookupAnesthesiaOutputSchema
>;
export type CostGetFacilitiesOutput = z.infer<
	typeof GetFacilitiesOutputSchema
>;
export type CostHealthOutput = z.infer<typeof CostHealthOutputSchema>;
export type CostGetStatsOutput = z.infer<typeof CostGetStatsOutputSchema>;
