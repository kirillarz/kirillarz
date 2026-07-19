import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/",
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, "tests/visual/**"],
  },
});
