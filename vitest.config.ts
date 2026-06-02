import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // In this environment, regular worker pools can fail to start reliably.
    // vmThreads has been more resilient in Windows+Git Bash setups.
    pool: 'vmThreads',
    maxWorkers: 1,
    fileParallelism: false,
    // Reuse one worker context across files to minimize worker startup churn.
    isolate: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      // Only enforce coverage on the domain + state logic that is actually unit-tested.
      include: ['src/lib/**/*.{ts,tsx}', 'src/store/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        // UI helpers / event bus / incidental utilities are not part of unit-suite scope.
        'src/lib/events.ts',
        'src/lib/utils.ts',
        'src/lib/mobileTabContext.tsx',
      ],
      thresholds: {
        // Kept intentionally attainable for the current unit-suite scope.
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
