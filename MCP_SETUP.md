# MCP Server Setup

Once you have your `SEQUOIA_CODES_API_KEY`, you can add the SequoiaCodes MCP server to give your AI tools direct access to medical code search and lookup.

## Add to Claude Code

```bash
claude mcp add sequoia-codes -- npx -y @sequoiaport/codes@latest
```

Then set the API key as an environment variable so the MCP server can use it:

```bash
# Add to your shell profile (.zshrc, .bashrc, etc.)
export SEQUOIA_CODES_API_KEY="sk_live_seq_..."
```

## Add to Cursor

In `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sequoia-codes": {
      "command": "npx",
      "args": ["-y", "@sequoiaport/codes@latest"],
      "env": {
        "SEQUOIA_CODES_API_KEY": "sk_live_seq_..."
      }
    }
  }
}
```

## Add to VS Code

In `.vscode/mcp.json`:

```json
{
  "servers": {
    "sequoia-codes": {
      "command": "npx",
      "args": ["-y", "@sequoiaport/codes@latest"],
      "env": {
        "SEQUOIA_CODES_API_KEY": "sk_live_seq_..."
      }
    }
  }
}
```

## Available Tools

The MCP server exposes 3 tools:

### `searchCode`
Search medical codes by description.
- `system` (required): `icd10`, `cpt`, `hcpcs`, `snomed`, `rxnorm`, or `loinc`
- `query` (required): search text
- `limit` (optional): max results (1–200)
- `billingOnly` (optional): ICD-10 only — filter to billable codes

### `identifyCode`
Look up a specific code, get cost data, ICD-10 links, panel members, ingredients, or chapters.
- `system` (required): `icd10`, `cpt`, `hcpcs`, `snomed`, `rxnorm`, or `loinc`
- `code` (required for most actions): the code to look up
- `type` (optional): RxNorm only — `ndc` or `rxcui`
- `action` (optional): `lookup` (default), `getCost`, `linkIcd10`, `getPanelMembers`, `getIngredients`, `getChapters`

### `searchGuidelines`
Search or look up Medicare coverage guidelines.
- `system` (required): `lcd` or `ncd`
- `query` (optional): search text
- `id` (optional): guideline ID for direct lookup
- `section` (optional): NCD only — section number
- `limit` (optional): max results (1–200)
