/**
 * Simplified Public SDK Engine Categories
 *
 * Each coding system has:
 * - searchCode() - hybrid search
 * - identifyCode() - lookup by code
 * - Unique methods specific to that system
 *
 * All inputs are Zod objects (even single-parameter methods).
 */

import { z } from "zod";

// Import Output Types from local schemas
import type {
	SnomedSearchOutput,
	SnomedLookupOutput,
} from "./schemas/snomed";

import type {
	Icd10SearchOutput,
	Icd10LookupOutput,
	Icd10GetChaptersOutput,
} from "./schemas/icd10";

import type {
	CptSearchOutput,
	CptGetCodeOutput,
	CptGetCostOutput,
	CptLinkIcd10Output,
	LcdSearchOutput,
	LcdGetOutput,
	NcdSearchOutput,
	NcdGetOutput,
} from "./schemas/cpt-hcpcs";

import type {
	LoincSearchOutput,
	LoincLookupOutput,
	LoincGetPanelMembersOutput,
} from "./schemas/loinc";

import type {
	RxnormSearchOutput,
	RxnormLookupNdcOutput,
	RxnormLookupRxcuiOutput,
	RxnormGetIngredientsOutput,
} from "./schemas/rxnorm";

import type {
	LELookupByAgeOutput,
	LELookupBatchOutput,
	LEGetTableOutput,
	LEGetVersionOutput,
	LEHealthOutput,
	LEGetStatsOutput,
} from "./schemas/life-expectancy";

import type {
	NdcLookupOutput,
	NdcBatchLookupOutput,
	NdcSearchOutput,
	NdcFuzzySearchOutput,
	NdcGetProductOutput,
	NdcGetLabelerOutput,
	NdcGetPackagesOutput,
	NdcCrossRefOutput,
	NdcGetStatsOutput,
	NdcHealthOutput,
} from "./schemas/ndc";

// =============================================================================
// Shared Types
// =============================================================================

type RequestFunction = <TResult>(
	path: string,
	params?: Record<string, unknown>,
	method?: "GET" | "POST",
) => Promise<TResult>;

// =============================================================================
// SNOMED Category - client.snomed.*
// =============================================================================

const SnomedSearchCodeInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
});

const SnomedIdentifyCodeInputSchema = z.object({
	code: z.string().min(1),
});

export type SnomedSearchCodeInput = z.infer<typeof SnomedSearchCodeInputSchema>;
export type SnomedIdentifyCodeInput = z.infer<
	typeof SnomedIdentifyCodeInputSchema
>;

/**
 * SNOMED CT coding system.
 * - searchCode(): Hybrid search for SNOMED concepts
 * - identifyCode(): Lookup a specific SNOMED concept by code
 */
export class SnomedCategory {
	constructor(private request: RequestFunction) {}

	async searchCode(input: SnomedSearchCodeInput): Promise<SnomedSearchOutput> {
		const validated = SnomedSearchCodeInputSchema.parse(input);
		return this.request<SnomedSearchOutput>(
			"snomed/searchCode",
			validated,
		);
	}

	async identifyCode(
		input: SnomedIdentifyCodeInput,
	): Promise<SnomedLookupOutput> {
		const validated = SnomedIdentifyCodeInputSchema.parse(input);
		return this.request<SnomedLookupOutput>("snomed/identifyCode", {
			code: validated.code,
		});
	}
}

// =============================================================================
// ICD-10 Category - client.icd10.*
// =============================================================================

const Icd10SearchCodeInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
	billingOnly: z.boolean().optional(),
});

const Icd10IdentifyCodeInputSchema = z.object({
	code: z.string().min(1),
});

export type Icd10SearchCodeInput = z.infer<typeof Icd10SearchCodeInputSchema>;
export type Icd10IdentifyCodeInput = z.infer<
	typeof Icd10IdentifyCodeInputSchema
>;

/**
 * ICD-10 diagnosis coding system.
 * - searchCode(): Hybrid search for ICD-10 codes
 * - identifyCode(): Lookup a specific ICD-10 code
 * - getChapters(): Get all ICD-10 chapters
 */
export class Icd10Category {
	constructor(private request: RequestFunction) {}

	async searchCode(input: Icd10SearchCodeInput): Promise<Icd10SearchOutput> {
		const validated = Icd10SearchCodeInputSchema.parse(input);
		return this.request<Icd10SearchOutput>("icd10/searchCode", validated);
	}

	async identifyCode(
		input: Icd10IdentifyCodeInput,
	): Promise<Icd10LookupOutput> {
		const validated = Icd10IdentifyCodeInputSchema.parse(input);
		return this.request<Icd10LookupOutput>("icd10/identifyCode", {
			code: validated.code,
		});
	}

	async getChapters(): Promise<Icd10GetChaptersOutput> {
		return this.request<Icd10GetChaptersOutput>("icd10/getChapters", {});
	}
}

// =============================================================================
// CPT Category - client.cpt.*
// =============================================================================

const CptSearchCodeInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
});

const CptIdentifyCodeInputSchema = z.object({
	code: z.string().min(1),
});

const CptGetCostInputSchema = z.object({
	code: z.string().min(1),
});

const CptLinkIcd10InputSchema = z.object({
	code: z.string().min(1),
});

export type CptSearchCodeInput = z.infer<typeof CptSearchCodeInputSchema>;
export type CptIdentifyCodeInput = z.infer<typeof CptIdentifyCodeInputSchema>;
export type CptGetCostInput = z.infer<typeof CptGetCostInputSchema>;
export type CptLinkIcd10Input = z.infer<typeof CptLinkIcd10InputSchema>;

/**
 * CPT procedure coding system.
 * - searchCode(): Hybrid search for CPT codes
 * - identifyCode(): Lookup a specific CPT code
 * - getCost(): Get RVU/cost data for a CPT code
 * - linkIcd10(): Get ICD-10 linking terms for a CPT code
 */
export class CptCategory {
	constructor(private request: RequestFunction) {}

	async searchCode(input: CptSearchCodeInput): Promise<CptSearchOutput> {
		const validated = CptSearchCodeInputSchema.parse(input);
		return this.request<CptSearchOutput>("cpt/searchCode", validated);
	}

	async identifyCode(input: CptIdentifyCodeInput): Promise<CptGetCodeOutput> {
		const validated = CptIdentifyCodeInputSchema.parse(input);
		return this.request<CptGetCodeOutput>("cpt/identifyCode", {
			code: validated.code,
		});
	}

	async getCost(input: CptGetCostInput): Promise<CptGetCostOutput> {
		const validated = CptGetCostInputSchema.parse(input);
		return this.request<CptGetCostOutput>("cpt/getCost", {
			code: validated.code,
		});
	}

	async linkIcd10(input: CptLinkIcd10Input): Promise<CptLinkIcd10Output> {
		const validated = CptLinkIcd10InputSchema.parse(input);
		return this.request<CptLinkIcd10Output>("cpt/linkIcd10", {
			code: validated.code,
		});
	}
}

// =============================================================================
// HCPCS Category - client.hcpcs.*
// =============================================================================

const HcpcsSearchCodeInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
});

const HcpcsIdentifyCodeInputSchema = z.object({
	code: z.string().min(1),
});

const HcpcsGetCostInputSchema = z.object({
	code: z.string().min(1),
});

export type HcpcsSearchCodeInput = z.infer<typeof HcpcsSearchCodeInputSchema>;
export type HcpcsIdentifyCodeInput = z.infer<
	typeof HcpcsIdentifyCodeInputSchema
>;
export type HcpcsGetCostInput = z.infer<typeof HcpcsGetCostInputSchema>;

/**
 * HCPCS procedure coding system.
 * - searchCode(): Hybrid search for HCPCS codes
 * - identifyCode(): Lookup a specific HCPCS code
 * - getCost(): Get RVU/cost data for an HCPCS code
 */
export class HcpcsCategory {
	constructor(private request: RequestFunction) {}

	async searchCode(input: HcpcsSearchCodeInput): Promise<CptSearchOutput> {
		const validated = HcpcsSearchCodeInputSchema.parse(input);
		return this.request<CptSearchOutput>("hcpcs/searchCode", validated);
	}

	async identifyCode(input: HcpcsIdentifyCodeInput): Promise<CptGetCodeOutput> {
		const validated = HcpcsIdentifyCodeInputSchema.parse(input);
		return this.request<CptGetCodeOutput>("hcpcs/identifyCode", {
			code: validated.code,
		});
	}

	async getCost(input: HcpcsGetCostInput): Promise<CptGetCostOutput> {
		const validated = HcpcsGetCostInputSchema.parse(input);
		return this.request<CptGetCostOutput>("hcpcs/getCost", {
			code: validated.code,
		});
	}
}

// =============================================================================
// LOINC Category - client.loinc.*
// =============================================================================

const LoincSearchCodeInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
});

const LoincIdentifyCodeInputSchema = z.object({
	code: z.string().min(1),
});

const LoincGetPanelMembersInputSchema = z.object({
	code: z.string().min(1),
});

export type LoincSearchCodeInput = z.infer<typeof LoincSearchCodeInputSchema>;
export type LoincIdentifyCodeInput = z.infer<
	typeof LoincIdentifyCodeInputSchema
>;
export type LoincGetPanelMembersInput = z.infer<
	typeof LoincGetPanelMembersInputSchema
>;

/**
 * LOINC laboratory test coding system.
 * - searchCode(): Hybrid search for LOINC codes
 * - identifyCode(): Lookup a specific LOINC code
 * - getPanelMembers(): Get all tests in a panel
 */
export class LoincCategory {
	constructor(private request: RequestFunction) {}

	async searchCode(input: LoincSearchCodeInput): Promise<LoincSearchOutput> {
		const validated = LoincSearchCodeInputSchema.parse(input);
		return this.request<LoincSearchOutput>(
			"loinc/searchCode",
			validated,
		);
	}

	async identifyCode(input: LoincIdentifyCodeInput): Promise<LoincLookupOutput> {
		const validated = LoincIdentifyCodeInputSchema.parse(input);
		return this.request<LoincLookupOutput>("loinc/identifyCode", {
			code: validated.code,
		});
	}

	async getPanelMembers(
		input: LoincGetPanelMembersInput,
	): Promise<LoincGetPanelMembersOutput> {
		const validated = LoincGetPanelMembersInputSchema.parse(input);
		return this.request<LoincGetPanelMembersOutput>(
			"loinc/getPanelMembers",
			{ code: validated.code },
		);
	}
}

// =============================================================================
// RxNorm Category - client.rxnorm.*
// =============================================================================

const RxnormSearchCodeInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
});

const RxnormIdentifyCodeInputSchema = z.object({
	type: z.enum(["ndc", "rxcui"]),
	code: z.string().min(1),
});

const RxnormGetIngredientsInputSchema = z.object({
	rxcui: z.string().min(1),
});

export type RxnormSearchCodeInput = z.infer<typeof RxnormSearchCodeInputSchema>;
export type RxnormIdentifyCodeInput = z.infer<
	typeof RxnormIdentifyCodeInputSchema
>;
export type RxnormGetIngredientsInput = z.infer<
	typeof RxnormGetIngredientsInputSchema
>;

/**
 * RxNorm drug/medication coding system.
 * - searchCode(): Search for drugs by name
 * - identifyCode({ type, code }): Lookup by NDC or RXCUI
 * - getIngredients(): Get active ingredients for a drug
 */
export class RxnormCategory {
	constructor(private request: RequestFunction) {}

	async searchCode(input: RxnormSearchCodeInput): Promise<RxnormSearchOutput> {
		const validated = RxnormSearchCodeInputSchema.parse(input);
		return this.request<RxnormSearchOutput>("rxnorm/searchCode", validated);
	}

	async identifyCode(
		input: RxnormIdentifyCodeInput,
	): Promise<RxnormLookupNdcOutput | RxnormLookupRxcuiOutput> {
		const validated = RxnormIdentifyCodeInputSchema.parse(input);
		return this.request<RxnormLookupNdcOutput | RxnormLookupRxcuiOutput>(
			"rxnorm/identifyCode",
			{ type: validated.type, code: validated.code },
		);
	}

	async getIngredients(
		input: RxnormGetIngredientsInput,
	): Promise<RxnormGetIngredientsOutput> {
		const validated = RxnormGetIngredientsInputSchema.parse(input);
		return this.request<RxnormGetIngredientsOutput>(
			"rxnorm/getIngredients",
			validated,
		);
	}
}

// =============================================================================
// LCD Category - client.lcd.*
// =============================================================================

const LcdSearchGuidelinesInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
});

const LcdIdentifyGuidelineInputSchema = z.object({
	id: z.string().min(1),
});

export type LcdSearchGuidelinesInput = z.infer<
	typeof LcdSearchGuidelinesInputSchema
>;
export type LcdIdentifyGuidelineInput = z.infer<
	typeof LcdIdentifyGuidelineInputSchema
>;

/**
 * LCD (Local Coverage Determination) guidelines.
 * - searchGuidelines(): Search LCD guidelines by text
 * - identifyGuideline(): Lookup a specific LCD by ID
 */
export class LcdCategory {
	constructor(private request: RequestFunction) {}

	async searchGuidelines(
		input: LcdSearchGuidelinesInput,
	): Promise<LcdSearchOutput> {
		const validated = LcdSearchGuidelinesInputSchema.parse(input);
		return this.request<LcdSearchOutput>(
			"lcd/searchGuidelines",
			validated,
		);
	}

	async identifyGuideline(input: LcdIdentifyGuidelineInput): Promise<LcdGetOutput> {
		const validated = LcdIdentifyGuidelineInputSchema.parse(input);
		return this.request<LcdGetOutput>("lcd/identifyGuideline", {
			id: validated.id,
		});
	}
}

// =============================================================================
// NCD Category - client.ncd.*
// =============================================================================

const NcdSearchGuidelinesInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(200).optional(),
});

const NcdIdentifyGuidelineInputSchema = z
	.object({
		id: z.string().optional(),
		section: z.string().optional(),
	})
	.refine((data) => data.id || data.section, {
		message: "Either id or section must be provided",
	});

export type NcdSearchGuidelinesInput = z.infer<
	typeof NcdSearchGuidelinesInputSchema
>;
export type NcdIdentifyGuidelineInput = z.infer<
	typeof NcdIdentifyGuidelineInputSchema
>;

/**
 * NCD (National Coverage Determination) guidelines.
 * - searchGuidelines(): Search NCD guidelines by text
 * - identifyGuideline(): Lookup a specific NCD by ID or section
 */
export class NcdCategory {
	constructor(private request: RequestFunction) {}

	async searchGuidelines(
		input: NcdSearchGuidelinesInput,
	): Promise<NcdSearchOutput> {
		const validated = NcdSearchGuidelinesInputSchema.parse(input);
		return this.request<NcdSearchOutput>(
			"ncd/searchGuidelines",
			validated,
		);
	}

	async identifyGuideline(
		input: NcdIdentifyGuidelineInput,
	): Promise<NcdGetOutput> {
		const validated = NcdIdentifyGuidelineInputSchema.parse(input);
		return this.request<NcdGetOutput>("ncd/identifyGuideline", {
			id: validated.id,
			section: validated.section,
		});
	}
}

// =============================================================================
// Life Expectancy Category - client.lifeExpectancy.*
// =============================================================================

const LELookupByAgeInputSchema = z.object({
	age: z.number().int().min(0).max(125),
	gender: z.enum(["male", "female", "total"]).optional(),
});

const LELookupBatchInputSchema = z.object({
	ages: z.array(z.number().int().min(0).max(125)).min(1).max(500),
	gender: z.enum(["male", "female", "total"]).optional(),
});

const LEGetTableInputSchema = z.object({
	gender: z.enum(["male", "female", "total"]).optional(),
	min_age: z.number().int().min(0).optional(),
	max_age: z.number().int().max(125).optional(),
});

export type LELookupByAgeInput = z.infer<typeof LELookupByAgeInputSchema>;
export type LELookupBatchInput = z.infer<typeof LELookupBatchInputSchema>;
export type LEGetTableInput = z.infer<typeof LEGetTableInputSchema>;

/**
 * Life Expectancy actuarial tables (CDC/CMS WCMSA standard).
 * - lookupByAge(): Get life expectancy for a specific age
 * - lookupBatch(): Batch lookup for multiple ages
 * - getTable(): Get the full actuarial life table (or a filtered range)
 * - getVersion(): Get active dataset version metadata
 * - getStats(): Get database statistics
 * - health(): Engine health check
 */
export class LifeExpectancyCategory {
	constructor(private request: RequestFunction) {}

	async lookupByAge(input: LELookupByAgeInput): Promise<LELookupByAgeOutput> {
		const validated = LELookupByAgeInputSchema.parse(input);
		return this.request<LELookupByAgeOutput>(
			"lifeExpectancy/lookupByAge",
			validated,
		);
	}

	async lookupBatch(input: LELookupBatchInput): Promise<LELookupBatchOutput> {
		const validated = LELookupBatchInputSchema.parse(input);
		return this.request<LELookupBatchOutput>(
			"lifeExpectancy/lookupBatch",
			validated,
		);
	}

	async getTable(input?: LEGetTableInput): Promise<LEGetTableOutput> {
		const validated = LEGetTableInputSchema.parse(input ?? {});
		return this.request<LEGetTableOutput>(
			"lifeExpectancy/getTable",
			validated,
		);
	}

	async getVersion(): Promise<LEGetVersionOutput> {
		return this.request<LEGetVersionOutput>(
			"lifeExpectancy/getVersion",
			{},
		);
	}

	async getStats(): Promise<LEGetStatsOutput> {
		return this.request<LEGetStatsOutput>("lifeExpectancy/getStats", {});
	}

	async health(): Promise<LEHealthOutput> {
		return this.request<LEHealthOutput>("lifeExpectancy/health", {});
	}
}

// =============================================================================
// NDC Category - client.ndc.*
// =============================================================================

const NdcLookupInputSchema = z.object({
	ndc: z.string().min(1),
});

const NdcBatchLookupInputSchema = z.object({
	ndcs: z.array(z.string().min(1)).min(1).max(25),
});

const NdcSearchInputSchema = z.object({
	query: z.string().min(1),
	productType: z.string().optional(),
	limit: z.number().int().min(1).max(100).optional(),
});

const NdcFuzzySearchInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(50).optional(),
});

const NdcGetProductInputSchema = z.object({
	productNdc: z.string().min(1),
});

const NdcGetLabelerInputSchema = z.object({
	labeler: z.string().min(1),
	limit: z.number().int().min(1).max(100).optional(),
});

const NdcGetPackagesInputSchema = z.object({
	productNdc: z.string().min(1),
});

const NdcCrossRefInputSchema = z.object({
	ndc: z.string().min(1),
});

export type NdcLookupInput = z.infer<typeof NdcLookupInputSchema>;
export type NdcBatchLookupInput = z.infer<typeof NdcBatchLookupInputSchema>;
export type NdcSearchInput = z.infer<typeof NdcSearchInputSchema>;
export type NdcFuzzySearchInput = z.infer<typeof NdcFuzzySearchInputSchema>;
export type NdcGetProductInput = z.infer<typeof NdcGetProductInputSchema>;
export type NdcGetLabelerInput = z.infer<typeof NdcGetLabelerInputSchema>;
export type NdcGetPackagesInput = z.infer<typeof NdcGetPackagesInputSchema>;
export type NdcCrossRefInput = z.infer<typeof NdcCrossRefInputSchema>;

/**
 * FDA NDC Directory - drug product identification.
 * - lookupNdc(): Look up a product by package NDC (any format)
 * - lookupBatch(): Batch lookup multiple NDCs
 * - searchProducts(): Full-text search by drug name
 * - searchFuzzy(): Fuzzy trigram search (handles misspellings)
 * - getProduct(): Get full product details by product NDC
 * - getLabeler(): Get all products from a labeler/manufacturer
 * - getPackages(): Get all packages for a product NDC
 * - crossRefRxcui(): Cross-reference NDC with RxNorm RXCUI
 * - getStats(): Get database statistics
 * - health(): Engine health check
 */
export class NdcCategory {
	constructor(private request: RequestFunction) {}

	async lookupNdc(input: NdcLookupInput): Promise<NdcLookupOutput> {
		const validated = NdcLookupInputSchema.parse(input);
		return this.request<NdcLookupOutput>("ndc/lookupNdc", {
			ndc: validated.ndc,
		});
	}

	async lookupBatch(input: NdcBatchLookupInput): Promise<NdcBatchLookupOutput> {
		const validated = NdcBatchLookupInputSchema.parse(input);
		return this.request<NdcBatchLookupOutput>("ndc/lookupBatch", {
			ndcs: validated.ndcs,
		});
	}

	async searchProducts(input: NdcSearchInput): Promise<NdcSearchOutput> {
		const validated = NdcSearchInputSchema.parse(input);
		return this.request<NdcSearchOutput>("ndc/searchProducts", {
			query: validated.query,
			product_type: validated.productType,
			limit: validated.limit,
		});
	}

	async searchFuzzy(input: NdcFuzzySearchInput): Promise<NdcFuzzySearchOutput> {
		const validated = NdcFuzzySearchInputSchema.parse(input);
		return this.request<NdcFuzzySearchOutput>("ndc/searchFuzzy", {
			query: validated.query,
			limit: validated.limit,
		});
	}

	async getProduct(input: NdcGetProductInput): Promise<NdcGetProductOutput> {
		const validated = NdcGetProductInputSchema.parse(input);
		return this.request<NdcGetProductOutput>("ndc/getProduct", {
			product_ndc: validated.productNdc,
		});
	}

	async getLabeler(input: NdcGetLabelerInput): Promise<NdcGetLabelerOutput> {
		const validated = NdcGetLabelerInputSchema.parse(input);
		return this.request<NdcGetLabelerOutput>("ndc/getLabeler", {
			labeler: validated.labeler,
			limit: validated.limit,
		});
	}

	async getPackages(input: NdcGetPackagesInput): Promise<NdcGetPackagesOutput> {
		const validated = NdcGetPackagesInputSchema.parse(input);
		return this.request<NdcGetPackagesOutput>("ndc/getPackages", {
			product_ndc: validated.productNdc,
		});
	}

	async crossRefRxcui(input: NdcCrossRefInput): Promise<NdcCrossRefOutput> {
		const validated = NdcCrossRefInputSchema.parse(input);
		return this.request<NdcCrossRefOutput>("ndc/crossRefRxcui", {
			ndc: validated.ndc,
		});
	}

	async getStats(): Promise<NdcGetStatsOutput> {
		return this.request<NdcGetStatsOutput>("ndc/getStats", {});
	}

	async health(): Promise<NdcHealthOutput> {
		return this.request<NdcHealthOutput>("ndc/health", {});
	}
}
