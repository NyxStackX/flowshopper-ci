import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Unit tests: server code in Node; React component tests ask for a simulated browser
// (jsdom) with a // @vitest-environment jsdom comment at the top of their file.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/unit/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['server/**/*.js', 'client/src/**/*.{js,jsx}'],
      exclude: ['server/index.js', 'client/src/main.jsx'],
      reporter: ['text', 'html', 'json-summary'],
      // The merge is blocked below this threshold (subject: at least 60 %).
      thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 },
    },
  },
});
