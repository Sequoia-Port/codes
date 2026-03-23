---
name: life-expectancy
description: CDC/CMS life expectancy actuarial table lookups for WCMSA calculations. Activates when tasks involve life expectancy, actuarial tables, life tables, WCMSA, Medicare Set-Asides, or age-based mortality data.
license: MIT
author: SequoiaPort
version: 0.1.0
---

# Life Expectancy

Look up CDC life expectancy data from the National Vital Statistics Reports (NVSR) actuarial life tables via the `@sequoiaport/codes` package. Used for Workers' Compensation Medicare Set-Aside (WCMSA) calculations per CMS requirements.

## When to Apply

- User asks about life expectancy for a given age
- User needs actuarial life table data (qx, lx, dx, ex values)
- User is performing WCMSA or Medicare Set-Aside calculations
- User mentions CDC life tables, NVSR, or mortality data
- User needs batch lookups for multiple ages
- User wants to compare male/female/total life expectancy

## Getting an API Key

First check if `SEQUOIA_CODES_API_KEY` is already set in the environment. If it is, skip key generation entirely and proceed to usage. Only if no key exists, see [AGENT_PROMPT.md](../../AGENT_PROMPT.md) for how your agent can obtain one via the agent auth flow.

## MCP Server

Once you have an API key, you can set up the MCP server for direct tool access from Claude Code, Cursor, or VS Code. See [MCP_SETUP.md](../../MCP_SETUP.md).

## How It Works

```typescript
import { SequoiaCodesClient } from "@sequoiaport/codes";

const client = new SequoiaCodesClient({
  apiKey: process.env.SEQUOIA_CODES_API_KEY!,
});
```

## Available Operations

### `client.lifeExpectancy.lookupByAge({ age, gender? })`
Get life expectancy for a specific age.

```typescript
const result = await client.lifeExpectancy.lookupByAge({ age: 65 });
// result.result → { age_start: 65, gender: "total", ex: 19.09, qx: 0.01548, lx: 82565, ... }
```

Gender defaults to `"total"` (both sexes combined, per CMS WCMSA standard). Options: `"male"`, `"female"`, `"total"`.

### `client.lifeExpectancy.lookupBatch({ ages, gender? })`
Batch lookup for multiple ages in a single call.

```typescript
const results = await client.lifeExpectancy.lookupBatch({
  ages: [30, 50, 65, 80],
  gender: "female",
});
// results.results → [{ age_start: 30, ex: 53.02, ... }, { age_start: 50, ex: 33.81, ... }, ...]
```

### `client.lifeExpectancy.getTable({ gender?, min_age?, max_age? })`
Get the full actuarial life table or a filtered range.

```typescript
// Full table (101 rows, ages 0-100)
const table = await client.lifeExpectancy.getTable({ gender: "total" });

// Filtered range
const seniors = await client.lifeExpectancy.getTable({
  gender: "male",
  min_age: 65,
  max_age: 85,
});
```

### `client.lifeExpectancy.getVersion()`
Get metadata about the active life table dataset (NVSR volume, data year, source URL).

```typescript
const version = await client.lifeExpectancy.getVersion();
// version.versions → [{ data_year: 2021, nvsr_volume: 75, nvsr_issue: 2, source_url: "...", ... }]
```

### `client.lifeExpectancy.getStats()`
Get database statistics.

```typescript
const stats = await client.lifeExpectancy.getStats();
```

### `client.lifeExpectancy.health()`
Engine health check.

```typescript
const health = await client.lifeExpectancy.health();
// health → { status: "healthy", engine: "life-expectancy", version: "1.0.0", database: { status: "ok", ... } }
```

## REST API (curl)

```bash
# Lookup life expectancy at age 65
curl -X GET "https://api.sequoiacodes.com/v1/lifeExpectancy/lookupByAge?age=65&gender=total" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Batch lookup
curl -X GET "https://api.sequoiacodes.com/v1/lifeExpectancy/lookupBatch?ages=[30,50,70]&gender=female" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Full life table
curl -X GET "https://api.sequoiacodes.com/v1/lifeExpectancy/getTable?gender=total" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"

# Dataset version info
curl -X GET "https://api.sequoiacodes.com/v1/lifeExpectancy/getVersion" \
  -H "Authorization: Bearer $SEQUOIA_CODES_API_KEY"
```

## Response Fields

Each life expectancy result includes:
- `age_start` - Age at start of interval (0-100)
- `age_end` - Age at end of interval (null for terminal "100 and older")
- `gender` - `"male"`, `"female"`, or `"total"`
- `data_year` - Year the data represents (e.g., 2021)
- `source` - Data source identifier
- `qx` - Probability of death between age_start and age_end
- `lx` - Number of survivors at age_start (out of 100,000 birth cohort)
- `dx` - Number of deaths between age_start and age_end
- `lx_person_years` - Person-years lived in the interval
- `tx` - Total person-years remaining above age_start
- `ex` - Life expectancy at age_start (in years)
- `nvsr_volume` - NVSR volume number (optional)
- `nvsr_issue` - NVSR issue number (optional)
- `cms_reference` - CMS reference identifier (optional)
