# @sequoiaport/codes

Official TypeScript/JavaScript SDK for the [Sequoia Codes API](https://sequoiacodes.com) — a unified API for medical code search and lookup.

Query **ICD-10**, **CPT**, **HCPCS**, **SNOMED CT**, **LOINC**, **RxNorm**, and **NDC** codes through a single client. The SDK also covers **LCD/NCD** coverage guidelines, **Life Expectancy** actuarial tables (CDC/CMS WCMSA standard), **4-tier cost projections** (Medicare, Commercial, 80th Percentile, Billed Charges), and a **clinical orchestrator** for cross-system operations like coverage checks and diagnosis-to-procedure mapping.

- Fully typed with Zod-validated responses
- Supports both ESM and CommonJS
- Includes [agent skills](https://skills.sh) for AI coding assistants

## Installation

```bash
npm install @sequoiaport/codes
```

## Quick Start

```typescript
import { SequoiaCodesClient } from "@sequoiaport/codes";

const client = new SequoiaCodesClient({
  apiKey: process.env.SEQUOIA_CODES_API_KEY!,
});

// Search for ICD-10 codes
const icd10Results = await client.icd10.searchCode({ query: "diabetes type 2" });
console.log(icd10Results.results);

// Look up a specific SNOMED code
const snomedCode = await client.snomed.identifyCode({ code: "73211009" });
console.log(snomedCode.concept);

// Search for CPT procedures
const cptResults = await client.cpt.searchCode({ query: "knee replacement" });
console.log(cptResults.results);
```

## API Categories

### Coding Systems

- **`client.snomed`** - SNOMED CT clinical terminology
- **`client.icd10`** - ICD-10 diagnosis codes
- **`client.cpt`** - CPT procedure codes
- **`client.hcpcs`** - HCPCS procedure codes
- **`client.loinc`** - LOINC laboratory test codes
- **`client.rxnorm`** - RxNorm drug/medication codes

### Drug Identification

- **`client.ndc`** - FDA NDC Directory (drug product identification, package lookup, RxNorm cross-reference)

### Actuarial / Reference Data

- **`client.lifeExpectancy`** - CDC/CMS WCMSA life expectancy actuarial tables
- **`client.ratedAge`** - Comorbidity-adjusted rated age for WC MSAs (Tier-1 substrate: SEER, USRDS, Framingham, NHANES, CDC NCHS). Returns rated age + full audit trail with T1/T2 citations, calculation trace, `rule_fire_events` (rule-layer firings), ASOP 41 attestation, and deterministic case_signature_hash.

### Cost Projection

- **`client.cost`** - 4-tier surgical/procedural cost estimates (Medicare, Commercial, 80th %ile, Billed)

### Guidelines

- **`client.lcd`** - Local Coverage Determinations
- **`client.ncd`** - National Coverage Determinations

### Orchestrators

- **`client.clinical`** - Cross-engine clinical operations
- **`client.system`** - System health and async results

## Examples

### SNOMED

```typescript
// Hybrid search
const results = await client.snomed.searchCode({
  query: "heart failure",
  limit: 10,
});

// Lookup by code
const concept = await client.snomed.identifyCode({ code: "84114007" });
```

### ICD-10

```typescript
// Search with billing filter
const results = await client.icd10.searchCode({
  query: "diabetes",
  billingOnly: true,
  limit: 20,
});

// Lookup specific code
const code = await client.icd10.identifyCode({ code: "E11.9" });

// Get all chapters
const chapters = await client.icd10.getChapters();
```

### CPT/HCPCS

```typescript
// Search CPT codes
const cptResults = await client.cpt.searchCode({ query: "colonoscopy" });

// Get cost/RVU data
const cost = await client.cpt.getCost({ code: "45378" });

// Get ICD-10 linking terms
const linkTerms = await client.cpt.linkIcd10({ code: "99213" });

// Search HCPCS codes
const hcpcsResults = await client.hcpcs.searchCode({ query: "wheelchair" });
```

### LOINC

```typescript
// Search lab tests
const results = await client.loinc.searchCode({ query: "glucose" });

// Lookup specific code
const test = await client.loinc.identifyCode({ code: "2345-7" });

// Get panel members
const panel = await client.loinc.getPanelMembers({ code: "24323-8" });
```

### RxNorm

```typescript
// Search drugs
const results = await client.rxnorm.searchCode({ query: "metformin" });

// Lookup by NDC
const ndcResult = await client.rxnorm.identifyCode({
  type: "ndc",
  code: "0002-4112-01",
});

// Lookup by RXCUI
const rxcuiResult = await client.rxnorm.identifyCode({
  type: "rxcui",
  code: "861004",
});

// Get active ingredients
const ingredients = await client.rxnorm.getIngredients({ rxcui: "861004" });
```

### NDC (Drug Products)

```typescript
// Look up a drug by NDC (any format: dashed, 10-digit, 11-digit)
const product = await client.ndc.lookupNdc({ ndc: "0071-0157-23" });
console.log(product.result?.brand_name); // "Lipitor"

// Search by drug name
const results = await client.ndc.searchProducts({ query: "metformin", limit: 10 });

// Fuzzy search (handles misspellings)
const fuzzy = await client.ndc.searchFuzzy({ query: "acetaminofen" });

// Batch lookup
const batch = await client.ndc.lookupBatch({ ndcs: ["0071-0157-23", "0006-3026-02"] });

// Cross-reference with RxNorm
const crossRef = await client.ndc.crossRefRxcui({ ndc: "0071-0157-23" });

// Get packages for a product
const packages = await client.ndc.getPackages({ productNdc: "0071-0157" });
```

### Cost Projection

```typescript
// Full 4-tier cost projection (Medicare, Commercial, 80th %ile, Billed)
const tiered = await client.cost.projectCostTiered({
  cpt_codes: ["27447"],
  zip_code: "60601",
  include_anesthesia: true,
});
console.log(tiered.result?.medicare.total);
console.log(tiered.result?.commercial.total);

// Medicare-only projection
const medicare = await client.cost.projectCost({
  cpt_codes: ["99213", "99214"],
  zip_code: "10001",
});

// MPFS rate lookup
const mpfs = await client.cost.lookupMPFS({ cpt_code: "99213", zip_code: "10001" });

// DRG-based facility fee
const fee = await client.cost.lookupFacilityFee({ cpt_code: "27447", zip_code: "60601" });

// WCMSA designated medical centers
const facilities = await client.cost.getFacilities({ zip_code: "60601" });
```

### Guidelines (LCD/NCD)

```typescript
// Search LCD guidelines
const lcdResults = await client.lcd.searchGuidelines({ query: "MRI" });

// Lookup specific LCD
const lcd = await client.lcd.identifyGuideline({ id: "L33288" });

// Search NCD guidelines
const ncdResults = await client.ncd.searchGuidelines({ query: "oxygen" });

// Lookup NCD by section
const ncd = await client.ncd.identifyGuideline({ section: "220.6" });
```

### Life Expectancy

```typescript
// Look up life expectancy for a 65-year-old
const le = await client.lifeExpectancy.lookupByAge({ age: 65 });
console.log(le.result?.ex); // e.g. 19.09 years

// Batch lookup for multiple ages
const batch = await client.lifeExpectancy.lookupBatch({
  ages: [30, 50, 70],
  gender: "female",
});

// Get the full actuarial life table
const table = await client.lifeExpectancy.getTable({ gender: "total" });

// Get active dataset version metadata
const version = await client.lifeExpectancy.getVersion();

// Health check
const health = await client.lifeExpectancy.health();
```

### Rated Age (Comorbidity-Adjusted)

Comorbidity-adjusted rated age for Workers' Compensation MSAs. Pairs naturally with `client.lifeExpectancy` — feed `rated_age` into a subsequent LE lookup to get a CMS-defensible rated life expectancy.

Substrate is **Tier-1 anchored** (SEER 21 cancer, USRDS 2024 renal, Framingham + ARIC heart failure, NHANES COPD, CDC NCHS mortality baseline). **Vendor LDB tables are never cited as primary substrate.** Every numeric claim on the response carries a tier-marked citation chain.

```typescript
// Primary entry — rated age + full audit trail
const result = await client.ratedAge.propose({
  age: 65,
  sex: "M",
  comorbidities: [{ code: "I50.21" }, { code: "N18.6" }],
});

console.log(result.rated_age);                                // → 80
console.log(result.confidence);                               // → "medium"
console.log(result.recommended_reinsurance_multiplier);       // → 1.15
console.log(result.contributors[0].citation.tier_marker);     // → "T1"
console.log(result.contributors[0].citation.source_name);     // → "Framingham Heart Study + ARIC"
console.log(result.calculation_trace);                        // ordered stacking steps (capped at 15y)
console.log(result.alternative_stacking);                     // v1/v2 side-by-side comparison
console.log(result.asop_attestation.methodology);             // ASOP 41 surface
console.log(result.case_signature_hash);                      // deterministic 64-char hex
```

**Body-system gating** — moderate contributor inclusion against the case's accepted body systems:

```typescript
// Knee-fracture-only claim → F-code depression excluded
const result = await client.ratedAge.propose({
  age: 50, sex: "M",
  comorbidities: [{ code: "F32.9" }, { code: "S52.501A" }],
  claim_context: { accepted_body_systems: ["musculoskeletal"] },
});
console.log(result.body_system_gating_applied);  // → true
console.log(result.contributors[0].body_system_moderation);
// → "excluded: code F32.9 outside accepted body systems [musculoskeletal]"
```

**v2 multiplicative-rank-decay stacking** — actuarially-correct joint hazard with rank-decay to suppress double-counting on correlated comorbidities:

```typescript
const r = await client.ratedAge.propose({
  age: 65, sex: "M",
  comorbidities: [{ code: "I50.21" }, { code: "N18.6" }],
  stacking_rule: "multiplicative_rank_decay_v2",
});
// Calculation trace adds: hr, adjusted_hr, decay_weight (0.7^rank),
//                         cumulative_joint_hr per step.
```

**Medication-as-severity upgrade** — SGLT2-i / ARNI / immune checkpoint inhibitors / dialysis-related meds bump the matching comorbidity to a more severe HR cohort BEFORE the lookup:

```typescript
// Dapagliflozin (RxNorm 1488564) on I50 upgrades to symptomatic_HFrEF
const r = await client.ratedAge.propose({
  age: 65, sex: "M",
  comorbidities: [{ code: "I50.21" }],
  medications: [{ rxnorm: "1488564" }],
});
```

**Single-code HR lookup**:

```typescript
const hr = await client.ratedAge.lookupHazardRatio({ code: "I50.21" });
console.log(hr.matched);      // → true
console.log(hr.hr);           // → 4.0
console.log(hr.delta_years);  // → 14.0
```

**Charlson / Elixhauser scoring** (peer-reviewed sanity-check overlay):

```typescript
const score = await client.ratedAge.scoreComorbidity({
  codes: ["I50.21", "N18.6"],
  index: "charlson",
});
console.log(score.score);     // → 4
console.log(score.category);  // → "high"
```

**Active version + corpus citations**:

```typescript
const v = await client.ratedAge.getVersion();
console.log(v.hazard_table_version);  // → 1
console.log(v.sources);               // T1/T2/T3-tier corpus list
console.log(v.activated_at);
```

**Health check**:

```typescript
const h = await client.ratedAge.health();
console.log(h.status);  // → "ok"
```

Full action reference: see `docs/api/rated-age.md` in [sqp-medical-codex](https://github.com/Sequoia-Port/sqp-medical-codex).

### Clinical Orchestrator

```typescript
// Check coverage for CPT + ICD-10 pair
const coverage = await client.clinical.checkCoverage({
  cpt_code: "99213",
  icd10_code: "E11.9",
});

// Map diagnosis to procedures
const procedures = await client.clinical.getProceduresForDiagnosis({
  icd10_code: "M17.11",
});

// Get metadata from all engines
const metadata = await client.clinical.getMetadata();
```

### System

```typescript
// Health check
const health = await client.system.health();

// Get async result
const result = await client.system.getResult({ request_id: "abc123" });
```

## Configuration

```typescript
const client = new SequoiaCodesClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.sequoiacodes.com", // optional
  version: "v1", // optional
});
```

## Error Handling

```typescript
import { SequoiaCodesClient, CodesApiError } from "@sequoiaport/codes";

try {
  const result = await client.icd10.searchCode({ query: "test" });
} catch (error) {
  if (error instanceof CodesApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    console.error(`Action: ${error.action}`);
  }
}
```

## TypeScript Support

All methods are fully typed. Import types as needed:

```typescript
import type {
  SnomedConcept,
  Icd10Code,
  CPTCode,
  LoincCode,
  RxnormDrug,
  NdcProduct,
  NdcPackage,
  LifeExpectancyResult,
  LEVersionInfo,
  TierBreakdown,
  MPFSRate,
  CostProjectTieredOutput,
} from "@sequoiaport/codes";
```

## Agent Skills

This SDK includes agent skills compatible with the [Vercel Agent Skills](https://skills.sh) ecosystem. Skills give AI coding agents the knowledge to use the Sequoia Codes SDK for medical coding tasks.

### Install Skills

```bash
# Install all skills from this repo
npx skills add sequoia-port/codes

# Or install individual skills
npx skills add sequoia-port/codes --skill icd10-codes
npx skills add sequoia-port/codes --skill cpt-codes
npx skills add sequoia-port/codes --skill snomed-codes
npx skills add sequoia-port/codes --skill hcpcs-codes
npx skills add sequoia-port/codes --skill loinc-codes
npx skills add sequoia-port/codes --skill rxnorm-codes
npx skills add sequoia-port/codes --skill life-expectancy
```

### Available Skills

| Skill | Description |
|-------|-------------|
| `icd10-codes` | ICD-10 diagnosis code search and lookup |
| `cpt-codes` | CPT procedure code search, lookup, cost/RVU, and ICD-10 linking |
| `snomed-codes` | SNOMED CT clinical terminology search and lookup |
| `hcpcs-codes` | HCPCS Level II code search, lookup, and cost |
| `loinc-codes` | LOINC laboratory test code search, lookup, and panel members |
| `rxnorm-codes` | RxNorm drug code search, NDC/RXCUI lookup, and ingredients |
| `ndc-codes` | FDA NDC Directory lookup, product search, fuzzy search, and RxNorm cross-reference |
| `life-expectancy` | CDC/CMS life expectancy actuarial table lookups for WCMSA calculations |
| `cost-projection` | 4-tier surgical cost projections (Medicare, Commercial, 80th %ile, Billed Charges) |

Skills are compatible with Claude Code, Cursor, GitHub Copilot, Gemini, and [17+ other agents](https://skills.sh).

## License

MIT
