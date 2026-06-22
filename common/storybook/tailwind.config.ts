import type { Config } from 'tailwindcss';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import preset from '@univerjs-infra/shared/tailwind';
import animate from 'tailwindcss-animate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packagesDir = fs.readdirSync(path.resolve(__dirname, '../../packages')).map((dir) => path.resolve(__dirname, `../../packages/${dir}`));

const tailwindProjects = packagesDir.reduce((acc, dir) => {
    const tailwindConfig = path.resolve(dir, 'tailwind.config.ts');
    if (fs.existsSync(tailwindConfig)) {
        acc.push(`${dir}/src/**/*.{js,ts,jsx,tsx}`);
    }
    return acc;
}, [] as string[]);

const config: Config = {
    presets: [preset],
    content: [
        '.storybook/**/*.{js,ts,jsx,tsx}',
        ...tailwindProjects,
    ],
    plugins: [
        animate,
    ],
};

export default config;
