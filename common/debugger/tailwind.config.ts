import type { Config } from 'tailwindcss';
import preset from '@univerjs-infra/shared/tailwind';

const config: Config = {
    presets: [preset],
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
    ],
};

export default config;
