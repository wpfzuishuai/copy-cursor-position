import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

const config = defineConfig({
  input: "src/extension.ts",
  output: {
    file: "out/extension.mjs",
    format: "es",
    sourcemap: true,
  },
  external: ["vscode"],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        module: "ESNext",
        moduleResolution: "bundler",
        declaration: false,
      },
    }),
  ],
});

export default config;
