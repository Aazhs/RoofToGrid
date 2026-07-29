import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
    reporters: 'default',
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/modules/**'],
      reporter: ['text', 'lcov'],
    },
  },
});
