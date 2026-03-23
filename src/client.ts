import { CodesApiError } from "./errors";
import type { ApiResponse, SequoiaCodesClientConfig } from "./types";

// Import Engine Categories
import {
	CptCategory,
	HcpcsCategory,
	Icd10Category,
	LcdCategory,
	LifeExpectancyCategory,
	LoincCategory,
	NcdCategory,
	RxnormCategory,
	SnomedCategory,
} from "./engines";

// Import schemas from local clinical/system schemas
import {
	type CoverageCheckInput,
	CoverageCheckInputSchema,
	type CoverageCheckOutput,
	type DiagnosisToProceduresInput,
	DiagnosisToProceduresInputSchema,
	type DiagnosisToProceduresOutput,
	type GetCategoriesOutput,
} from "./schemas/clinical";

import {
	type GetResultInput,
	GetResultInputSchema,
	type GetResultOutput,
	type HealthOutput,
} from "./schemas/system";

// =============================================================================
// Types
// =============================================================================

type RequestFunction = <TResult>(
	path: string,
	params?: Record<string, unknown>,
	method?: "GET" | "POST",
) => Promise<TResult>;

// =============================================================================
// Orchestrator Category Classes
// =============================================================================

/**
 * Clinical orchestrator - cross-engine operations
 * - checkCoverage(): Check LCD coverage for CPT + ICD-10 pair
 * - getProceduresForDiagnosis(): Map diagnosis to relevant procedures
 * - getMetadata(): Get metadata from all engines
 */
class ClinicalCategory {
	constructor(private request: RequestFunction) {}

	/** Check LCD coverage for a CPT code + optional ICD-10 pair */
	async checkCoverage(input: CoverageCheckInput): Promise<CoverageCheckOutput> {
		const validated = CoverageCheckInputSchema.parse(input);
		return this.request<CoverageCheckOutput>(
			"clinical/checkCoverage",
			validated,
		);
	}

	/** Map a diagnosis (SNOMED or ICD-10) to relevant procedures */
	async getProceduresForDiagnosis(
		input: DiagnosisToProceduresInput,
	): Promise<DiagnosisToProceduresOutput> {
		const validated = DiagnosisToProceduresInputSchema.parse(input);
		return this.request<DiagnosisToProceduresOutput>(
			"clinical/getProceduresForDiagnosis",
			validated,
		);
	}

	/** Get metadata/categories from all engines (semantic tags, chapters, etc.) */
	async getMetadata(): Promise<GetCategoriesOutput> {
		return this.request<GetCategoriesOutput>("clinical/getMetadata", {});
	}
}

/** System actions: get async result, health check */
class SystemCategory {
	constructor(private request: RequestFunction) {}

	/** Get async request result by ID */
	async getResult(input: GetResultInput): Promise<GetResultOutput> {
		const validated = GetResultInputSchema.parse(input);
		return this.request<GetResultOutput>("system/getResult", validated);
	}

	/** Health check all engines */
	async health(): Promise<HealthOutput> {
		return this.request<HealthOutput>("system/health", {});
	}
}

// =============================================================================
// SequoiaCodesClient - Main API Client
// =============================================================================

const DEFAULT_BASE_URL = "https://api.sequoiacodes.com";
const DEFAULT_VERSION = "v1";

/**
 * Public TypeScript client for the Sequoia Medical Codes API.
 * Provides fully-typed access to all API endpoints via category namespaces.
 *
 * @example
 * ```typescript
 * const client = new SequoiaCodesClient({
 *   apiKey: process.env.SEQUOIA_CODES_API_KEY!,
 * });
 *
 * // Coding system searches
 * const icd10 = await client.icd10.searchCode({ query: "diabetes" });
 * const cpt = await client.cpt.searchCode({ query: "surgery" });
 * const snomed = await client.snomed.identifyCode({ code: "73211009" });
 *
 * // Guideline searches
 * const lcd = await client.lcd.searchGuidelines({ query: "MRI" });
 * const ncd = await client.ncd.identifyGuideline({ section: "220.6" });
 *
 * // Life expectancy (CDC/CMS WCMSA)
 * const le = await client.lifeExpectancy.lookupByAge({ age: 65 });
 *
 * // Orchestrator endpoints
 * const coverage = await client.clinical.checkCoverage({ cpt_code: "99213" });
 * const procedures = await client.clinical.getProceduresForDiagnosis({ icd10_code: "E11.9" });
 * ```
 */
export class SequoiaCodesClient {
	private apiKey: string;
	private baseUrl: string;
	private version: string;

	// ==========================================================================
	// Orchestrator Categories
	// ==========================================================================

	/** Clinical orchestrator: coverage check, diagnosis-to-procedures, metadata */
	readonly clinical: ClinicalCategory;
	/** System actions: get async result, health check */
	readonly system: SystemCategory;

	// ==========================================================================
	// Coding System Categories
	// ==========================================================================

	/** SNOMED CT coding system */
	readonly snomed: SnomedCategory;
	/** ICD-10 diagnosis codes */
	readonly icd10: Icd10Category;
	/** CPT procedure codes */
	readonly cpt: CptCategory;
	/** HCPCS procedure codes */
	readonly hcpcs: HcpcsCategory;
	/** LOINC laboratory test codes */
	readonly loinc: LoincCategory;
	/** RxNorm drug/medication codes */
	readonly rxnorm: RxnormCategory;

	// ==========================================================================
	// Actuarial / Reference Data Categories
	// ==========================================================================

	/** Life Expectancy actuarial tables (CDC/CMS WCMSA standard) */
	readonly lifeExpectancy: LifeExpectancyCategory;

	// ==========================================================================
	// Guideline Categories
	// ==========================================================================

	/** LCD (Local Coverage Determination) guidelines */
	readonly lcd: LcdCategory;
	/** NCD (National Coverage Determination) guidelines */
	readonly ncd: NcdCategory;

	constructor(config: SequoiaCodesClientConfig) {
		this.apiKey = config.apiKey;
		this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
		this.version = config.version ?? DEFAULT_VERSION;

		// Bind request and create category instances
		const boundRequest = this.request.bind(this);

		// Orchestrator categories
		this.clinical = new ClinicalCategory(boundRequest);
		this.system = new SystemCategory(boundRequest);

		// Coding system categories
		this.snomed = new SnomedCategory(boundRequest);
		this.icd10 = new Icd10Category(boundRequest);
		this.cpt = new CptCategory(boundRequest);
		this.hcpcs = new HcpcsCategory(boundRequest);
		this.loinc = new LoincCategory(boundRequest);
		this.rxnorm = new RxnormCategory(boundRequest);

		// Actuarial / reference data categories
		this.lifeExpectancy = new LifeExpectancyCategory(boundRequest);

		// Guideline categories
		this.lcd = new LcdCategory(boundRequest);
		this.ncd = new NcdCategory(boundRequest);
	}

	/**
	 * Make an HTTP request to the Codes API Gateway.
	 */
	private async request<TResult>(
		path: string,
		params?: Record<string, unknown>,
		method: "GET" | "POST" = "GET",
	): Promise<TResult> {
		const url = new URL(`${this.baseUrl}/${this.version}/${path}`);

		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
		};

		const options: RequestInit = {
			method,
			headers,
		};

		if (method === "GET" && params) {
			// Add query params for GET requests
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						url.searchParams.set(key, JSON.stringify(value));
					} else if (typeof value === "object") {
						url.searchParams.set(key, JSON.stringify(value));
					} else {
						url.searchParams.set(key, String(value));
					}
				}
			}
		} else if (method === "POST" && params) {
			options.body = JSON.stringify(params);
		}

		const response = await fetch(url.toString(), options);
		const data: ApiResponse<TResult> = await response.json();

		if (!response.ok || !data.success) {
			throw new CodesApiError(
				response.status,
				data.error || "Unknown error",
				path,
			);
		}

		return data.data as TResult;
	}
}
