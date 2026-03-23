import { z } from "zod";

// =============================================================================
// Entity Schemas
// =============================================================================

/** Life expectancy result for a single age/gender combination */
export const LifeExpectancyResultSchema = z.object({
	age_start: z.number().int().min(0),
	age_end: z.number().int().nullable(), // null for open-ended terminal age ("100 and older")
	gender: z.enum(["male", "female", "total"]),
	data_year: z.number().int(),
	source: z.string(),
	// Actuarial table columns
	qx: z.number(), // Probability of death between age_start and age_end
	lx: z.number(), // Number of survivors at age_start
	dx: z.number(), // Number of deaths between age_start and age_end
	lx_person_years: z.number(), // Person-years lived between age_start and age_end
	tx: z.number(), // Total person-years remaining above age_start
	ex: z.number(), // Life expectancy at age_start
	// Data source metadata
	nvsr_volume: z.number().int().optional(),
	nvsr_issue: z.number().int().optional(),
	cms_reference: z.string().optional(),
});

/** Version metadata for a life table dataset */
export const VersionInfoSchema = z.object({
	id: z.number().int(),
	nvsr_volume: z.number().int(),
	nvsr_issue: z.number().int(),
	data_year: z.number().int(),
	gender: z.string(),
	source_url: z.string(),
	cms_reference: z.string().optional(),
	status: z.string(),
	row_count: z.number().int(),
	ingested_at: z.string(),
});

// =============================================================================
// Output Schemas (used by public API)
// =============================================================================

/** lookupByAge output */
export const LookupByAgeOutputSchema = z.object({
	age_start: z.number().int(),
	gender: z.string(),
	found: z.boolean(),
	result: LifeExpectancyResultSchema.optional(),
});

/** lookupBatch output */
export const LookupBatchOutputSchema = z.object({
	gender: z.string(),
	count: z.number(),
	results: z.array(LifeExpectancyResultSchema),
});

/** getTable output */
export const GetTableOutputSchema = z.object({
	gender: z.string(),
	min_age: z.number().int(),
	max_age: z.number().int(),
	count: z.number(),
	results: z.array(LifeExpectancyResultSchema),
});

/** getVersion output */
export const GetVersionOutputSchema = z.object({
	count: z.number().int(),
	versions: z.array(VersionInfoSchema),
});

/** health output */
export const LEHealthOutputSchema = z.object({
	status: z.enum(["healthy", "degraded"]),
	engine: z.string().optional(),
	version: z.string().optional(),
	database: z
		.object({
			status: z.string(),
			total_conns: z.number().int().optional(),
			idle_conns: z.number().int().optional(),
			acquired_conns: z.number().int().optional(),
		})
		.optional(),
});

/** getStats output */
export const GetStatsOutputSchema = z.object({
	stats: z.record(z.string(), z.unknown()),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type LifeExpectancyResult = z.infer<typeof LifeExpectancyResultSchema>;
export type VersionInfo = z.infer<typeof VersionInfoSchema>;

export type LELookupByAgeOutput = z.infer<typeof LookupByAgeOutputSchema>;
export type LELookupBatchOutput = z.infer<typeof LookupBatchOutputSchema>;
export type LEGetTableOutput = z.infer<typeof GetTableOutputSchema>;
export type LEGetVersionOutput = z.infer<typeof GetVersionOutputSchema>;
export type LEHealthOutput = z.infer<typeof LEHealthOutputSchema>;
export type LEGetStatsOutput = z.infer<typeof GetStatsOutputSchema>;
