// =============================================================================
// Client & Core Types
// =============================================================================

export { SequoiaCodesClient } from "./client";
export type { SequoiaCodesClientConfig, ApiResponse } from "./types";
export { CodesApiError } from "./errors";

// =============================================================================
// Engine Category Classes
// =============================================================================

export {
	SnomedCategory,
	Icd10Category,
	CptCategory,
	HcpcsCategory,
	LoincCategory,
	RxnormCategory,
	NdcCategory,
	LcdCategory,
	NcdCategory,
	LifeExpectancyCategory,
	CostCategory,
} from "./engines";

// =============================================================================
// Engine Input Types (Simplified API)
// =============================================================================

export type {
	// SNOMED
	SnomedSearchCodeInput,
	SnomedIdentifyCodeInput,
	// ICD-10
	Icd10SearchCodeInput,
	Icd10IdentifyCodeInput,
	// CPT
	CptSearchCodeInput,
	CptIdentifyCodeInput,
	CptGetCostInput,
	CptLinkIcd10Input,
	// HCPCS
	HcpcsSearchCodeInput,
	HcpcsIdentifyCodeInput,
	HcpcsGetCostInput,
	// LOINC
	LoincSearchCodeInput,
	LoincIdentifyCodeInput,
	LoincGetPanelMembersInput,
	// RxNorm
	RxnormSearchCodeInput,
	RxnormIdentifyCodeInput,
	RxnormGetIngredientsInput,
	// NDC
	NdcLookupInput,
	NdcBatchLookupInput,
	NdcSearchInput,
	NdcFuzzySearchInput,
	NdcGetProductInput,
	NdcGetLabelerInput,
	NdcGetPackagesInput,
	NdcCrossRefInput,
	// LCD
	LcdSearchGuidelinesInput,
	LcdIdentifyGuidelineInput,
	// NCD
	NcdSearchGuidelinesInput,
	NcdIdentifyGuidelineInput,
	// Life Expectancy
	LELookupByAgeInput,
	LELookupBatchInput,
	LEGetTableInput,
	// Cost
	CostProjectTieredInput,
	CostProjectInput,
	CostLookupFacilityFeeInput,
	CostLookupMPFSInput,
	CostLookupAnesthesiaInput,
	CostGetFacilitiesInput,
} from "./engines";

// =============================================================================
// Orchestrator Types (Clinical, System)
// =============================================================================

export type {
	DiagnosisToProceduresInput,
	DiagnosisToProceduresOutput,
	CoverageCheckInput,
	CoverageCheckOutput,
	GetCategoriesOutput,
} from "./schemas/clinical";

export type {
	GetResultInput,
	GetResultOutput,
	HealthOutput,
	EngineStatus,
} from "./schemas/system";

// =============================================================================
// Entity Types (from schemas)
// =============================================================================

// SNOMED
export type {
	SnomedConcept,
	SnomedRelationship,
	Icd10Mapping,
	SnomedSearchOutput,
	SnomedLookupOutput,
} from "./schemas/snomed";

// ICD-10
export type {
	Icd10Code,
	Icd10Chapter,
	Icd10SearchOutput,
	Icd10LookupOutput,
	Icd10GetChaptersOutput,
} from "./schemas/icd10";

// CPT-HCPCS
export type {
	CPTCode,
	CptSearchOutput,
	CptGetCodeOutput,
	CptGetCostOutput,
	CptLinkIcd10Output,
	LcdSearchOutput,
	LcdGetOutput,
	NcdSearchOutput,
	NcdGetOutput,
} from "./schemas/cpt-hcpcs";

// LOINC
export type {
	LoincCode,
	PanelMember,
	PanelInfo,
	LoincSearchOutput,
	LoincLookupOutput,
	LoincGetPanelMembersOutput,
} from "./schemas/loinc";

// RxNorm
export type {
	RxnormDrug,
	NdcResult,
	RxnormSearchOutput,
	RxnormLookupNdcOutput,
	RxnormLookupRxcuiOutput,
	RxnormGetIngredientsOutput,
} from "./schemas/rxnorm";

// NDC
export type {
	NdcPackage,
	NdcProduct,
	NdcCrossRef,
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

// Life Expectancy
export type {
	LifeExpectancyResult,
	VersionInfo as LEVersionInfo,
	LELookupByAgeOutput,
	LELookupBatchOutput,
	LEGetTableOutput,
	LEGetVersionOutput,
	LEHealthOutput,
	LEGetStatsOutput,
} from "./schemas/life-expectancy";

// Cost
export type {
	TierBreakdown,
	TieredLineItem,
	MPFSRate,
	CostProjectTieredOutput,
	CostProjectOutput,
	CostLookupFacilityFeeOutput,
	CostLookupMPFSOutput,
	CostLookupAnesthesiaOutput,
	CostGetFacilitiesOutput,
	CostHealthOutput,
	CostGetStatsOutput,
} from "./schemas/cost";
