---
name: medical-codes
description: Comprehensive medical coding skill. Activates when tasks involve searching, looking up, or validating medical codes across ICD-10, CPT, HCPCS, SNOMED CT, LOINC, RxNorm, LCD/NCD guidelines, and clinical orchestration.
license: MIT
author: SequoiaPort
version: 0.1.0
---

# Medical Codes

Complete medical coding capabilities via the `@sequoiaport/codes` package. Search, lookup, and validate codes across all major medical coding systems.

## When to Apply

- User asks to search, lookup, or validate any medical code
- User needs ICD-10, CPT, HCPCS, SNOMED, LOINC, or RxNorm codes
- User needs coverage or guideline checks (LCD/NCD)
- User mentions medical billing, diagnosis codes, procedure codes, lab codes, or drug codes
- User needs to map a diagnosis to procedures or check coverage

## Getting an API Key

If the user does not have a `SEQUOIA_CODES_API_KEY`, you can obtain one programmatically using the Agent Auth API.

**Important:** The Agent Auth API is on the portal (`https://sequoiacodes.com`), NOT the data API (`https://api.sequoiacodes.com`). Only use `api.sequoiacodes.com` for code search/lookup after you have the key.

1. **Create a session**: `POST https://sequoiacodes.com/api/agent-auth/session` with optional `{ "agent_id": "your-agent-name" }`. Returns `session_id`, `session_secret`, and `auth_url`.
2. **Present `auth_url` to the user**: Ask them to click the link to sign in or sign up (free tier: 1,000 requests/month, no credit card).
3. **Poll for the key**: `GET https://sequoiacodes.com/api/agent-auth/session/{session_id}` with `Authorization: Bearer {session_secret}`. Poll every 3s until `status: "completed"` returns `api_key`.
4. **Store the key**: The `api_key` is returned exactly once. Save it as `SEQUOIA_CODES_API_KEY`.

```typescript
// Step 1: Create session
const session = await fetch("https://sequoiacodes.com/api/agent-auth/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ agent_id: "my-agent" }),
}).then(r => r.json());

// Step 2: Present link to user
console.log(`Please sign in: ${session.auth_url}`);

// Step 3: Poll for API key
let apiKey = null;
while (!apiKey && Date.now() < session.expires_at) {
  await new Promise(r => setTimeout(r, 3000));
  const result = await fetch(
    `https://sequoiacodes.com/api/agent-auth/session/${session.session_id}`,
    { headers: { Authorization: `Bearer ${session.session_secret}` } }
  ).then(r => r.json());
  if (result.status === "completed" && result.api_key) apiKey = result.api_key;
  if (result.status === "expired") throw new Error("Session expired");
}
```

## How It Works

1. Install the SDK: `npm install @sequoiaport/codes`
2. Initialize the client with your API key
3. Call the appropriate category method

```typescript
import { SequoiaCodesClient } from "@sequoiaport/codes";

const client = new SequoiaCodesClient({
  apiKey: process.env.SEQUOIA_CODES_API_KEY!,
});
```

## Available Operations

### Coding Systems

| System | Search | Lookup | Extra Methods |
|--------|--------|--------|---------------|
| `client.icd10` | `searchCode({ query })` | `identifyCode({ code })` | `getChapters()` |
| `client.cpt` | `searchCode({ query })` | `identifyCode({ code })` | `getCost({ code })`, `linkIcd10({ code })` |
| `client.hcpcs` | `searchCode({ query })` | `identifyCode({ code })` | `getCost({ code })` |
| `client.snomed` | `searchCode({ query })` | `identifyCode({ code })` | - |
| `client.loinc` | `searchCode({ query })` | `identifyCode({ code })` | `getPanelMembers({ code })` |
| `client.rxnorm` | `searchCode({ query })` | `identifyCode({ type, code })` | `getIngredients({ rxcui })` |

### Guidelines

| System | Search | Lookup |
|--------|--------|--------|
| `client.lcd` | `searchGuidelines({ query })` | `identifyGuideline({ id })` |
| `client.ncd` | `searchGuidelines({ query })` | `identifyGuideline({ id, section })` |

### Clinical Orchestrator

- `client.clinical.checkCoverage({ cpt_code, icd10_code? })` - Check LCD coverage for a CPT + ICD-10 pair
- `client.clinical.getProceduresForDiagnosis({ icd10_code?, snomed_id?, query? })` - Map diagnosis to procedures
- `client.clinical.getMetadata()` - Get metadata from all engines

### System

- `client.system.health()` - Health check all engines
- `client.system.getResult({ request_id })` - Get async request result

## Usage Examples

### Search for a diagnosis code
```typescript
const results = await client.icd10.searchCode({ query: "type 2 diabetes", limit: 5 });
// results.results[0].code → "E11.9"
```

### Look up a procedure code
```typescript
const code = await client.cpt.identifyCode({ code: "99213" });
// code.result.short_description → "Office/outpatient visit est"
```

### Check coverage
```typescript
const coverage = await client.clinical.checkCoverage({
  cpt_code: "99213",
  icd10_code: "E11.9",
});
// coverage.has_guidelines → true/false
```

### Search for a drug
```typescript
const drugs = await client.rxnorm.searchCode({ query: "metformin" });
```

### Find lab tests in a panel
```typescript
const panel = await client.loinc.getPanelMembers({ code: "24323-8" });
// panel.members → [{ member_loinc, member_name, ... }]
```

All search methods accept `{ query: string, limit?: number }` (max 200).
All lookup methods accept `{ code: string }` (RxNorm needs `{ type: "ndc"|"rxcui", code }`).
All methods return fully typed responses with Zod validation.

## REST API (curl)

All endpoints use `GET` with Bearer token auth at `https://api.sequoiacodes.com/v1/`.

```bash
# ICD-10 search
curl -X GET "https://api.sequoiacodes.com/v1/icd10/searchCode?query=diabetes&limit=5" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# ICD-10 lookup
curl -X GET "https://api.sequoiacodes.com/v1/icd10/identifyCode?code=E11.9" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# CPT search
curl -X GET "https://api.sequoiacodes.com/v1/cpt/searchCode?query=knee%20replacement" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# CPT cost/RVU
curl -X GET "https://api.sequoiacodes.com/v1/cpt/getCost?code=99213" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# SNOMED search
curl -X GET "https://api.sequoiacodes.com/v1/snomed/searchCode?query=heart%20failure" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# LOINC search
curl -X GET "https://api.sequoiacodes.com/v1/loinc/searchCode?query=hemoglobin%20A1c" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# RxNorm search
curl -X GET "https://api.sequoiacodes.com/v1/rxnorm/searchCode?query=metformin" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# LCD guidelines
curl -X GET "https://api.sequoiacodes.com/v1/lcd/searchGuidelines?query=MRI%20spine" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Coverage check
curl -X GET "https://api.sequoiacodes.com/v1/clinical/checkCoverage?cpt_code=99213&icd10_code=E11.9" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Health check
curl -X GET "https://api.sequoiacodes.com/v1/system/health" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"
```
