import { createRequire } from 'node:module';
import process from 'node:process';
import { defineConfig, mergeConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const coverageProviderModule = require.resolve('@vitest/coverage-istanbul');
const isCI = process.env.CI === 'true';

export default function createConfig(options?: any) {
    return defineConfig(mergeConfig({
        test: {
            testTimeout: 30_000,
            hookTimeout: 30_000,
            css: {
                modules: {
                    classNameStrategy: 'non-scoped',
                },
            },
            environment: 'happy-dom',
            coverage: {
                reporter: isCI ? ['json', 'lcovonly'] : ['html'],
                provider: 'custom',
                // `customProviderModule` expects a file path. Using a bare
                // package name makes Vitest resolve it as a relative path from
                // each package root (e.g. `packages/foo/@vitest/...`) and fail.
                // Resolve it from this shared package's deps instead.
                customProviderModule: coverageProviderModule,
                include: ['src/**/*.{ts,tsx}'],
                exclude: [
                    'coverage/**',
                    'dist/**',
                    '**/[.]**',
                    '**/*.d.ts',
                    '**/virtual:*',
                    '**/__x00__*',
                    'cypress/**',
                    'test?(s)/**',
                    'test?(-*).?(c|m)[jt]s?(x)',
                    '**/*{.,-}{test,spec}?(-d).?(c|m)[jt]s?(x)',
                    '**/__test?(s)__/**',
                    '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
                    '**/vitest.{workspace,projects}.[jt]s?(on)',
                    '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
                    'lib/**',
                    'src/locale/**',
                    '**/*.stories.tsx',
                    '**/*/tailwind.config.ts',
                    'packages/protocol/**',
                    'packages/slides/**',
                    'packages/slides-ui/**',
                    '**/src/menu/**',
                    '**/src/plugin.ts',
                    '**/src/mobile-plugin.ts',
                    '**/src/facade/index.ts',
                    '**/src/config/config.ts',
                    '**/src/controllers/components.controller.ts',
                ],
            },
        },
    }, options ?? {}));
}
