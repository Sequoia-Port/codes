import { defineConfig } from "tsup";

export default defineConfig([
  {
    format: ["cjs", "esm"],
    entry: ["./src/index.ts"],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
  },
  {
    format: ["cjs"],
    entry: ["./src/mcp.ts"],
    banner: { js: "#!/usr/bin/env node" },
    shims: true,
    skipNodeModulesBundle: true,
    clean: false,
  },
]);
