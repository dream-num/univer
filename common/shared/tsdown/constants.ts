export const BUILD_OUTPUT_ROOT = 'dist';

export const BUILD_OUTPUT_DIRECTORIES = {
    cjs: 'lib/cjs',
    esm: 'lib/es',
    umd: 'lib/umd',
} as const;

export const CLEANUP_DIRECTORIES = ['dist', 'lib', 'coverage'] as const;
export const DEFAULT_BROWSER_TARGET = 'chrome70';
export const DEFAULT_ENTRY_FILE = 'src/index.ts';
export const FACADE_ENTRY_FILE = 'src/facade/index.ts';
export const LOCALE_DIRECTORY = 'src/locale';
export const SOURCE_DIRECTORY = 'src';
export const TYPE_BUILD_CONFIG_FILE = 'tsconfig.tsdown.build.json';
export const TYPE_BUILD_EXCLUDES = ['src/**/__tests__/**', 'src/**/*.spec.ts', 'src/**/*.test.ts'];
