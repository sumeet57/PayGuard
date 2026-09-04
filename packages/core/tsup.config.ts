import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  target: "node18",
  platform: "node",
  bundle: true,
  skipNodeModulesBundle: true, // DO NOT bundle axios, form-data, or razorpay into dist
});