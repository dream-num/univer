import type { Config } from 'tailwindcss';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import preset, { createTailwindContent } from '@univerjs-infra/shared/tailwind';
import animate from 'tailwindcss-animate';

const configs = {
    docs: [
        '../presets/packages/preset-docs-core/tailwind.config.ts',
        '../presets/packages/preset-docs-drawing/tailwind.config.ts',
        '../presets/packages/preset-docs-hyper-link/tailwind.config.ts',
        '../presets/packages/preset-docs-thread-comment/tailwind.config.ts',
    ],
    sheets: [
        '../presets/packages/preset-sheets-core/tailwind.config.ts',
        '../presets/packages/preset-sheets-conditional-formatting/tailwind.config.ts',
        '../presets/packages/preset-sheets-data-validation/tailwind.config.ts',
        '../presets/packages/preset-sheets-drawing/tailwind.config.ts',
        '../presets/packages/preset-sheets-filter/tailwind.config.ts',
        '../presets/packages/preset-sheets-find-replace/tailwind.config.ts',
        '../presets/packages/preset-sheets-hyper-link/tailwind.config.ts',
        '../presets/packages/preset-sheets-note/tailwind.config.ts',
        '../presets/packages/preset-sheets-sort/tailwind.config.ts',
        '../presets/packages/preset-sheets-table/tailwind.config.ts',
        '../presets/packages/preset-sheets-thread-comment/tailwind.config.ts',
    ],
    slides: [
        '../packages/slides-ui/tailwind.config.ts',
    ],
} as const;

export type ExampleTarget = keyof typeof configs;

export function createTailwindConfig(target: ExampleTarget): Config {
    const content = new Set<string>([`./src/${target}/**/*.{js,ts,jsx,tsx}`]);

    for (const configUrl of configs[target]) {
        const configPath = fileURLToPath(new URL(configUrl, import.meta.url));
        for (const pattern of createTailwindContent(configPath, { includeStyleDependencies: true })) {
            content.add(path.resolve(path.dirname(configPath), pattern));
        }
    }

    return {
        presets: [preset],
        content: [...content],
        plugins: [animate],
    };
}

export default createTailwindConfig('sheets');
