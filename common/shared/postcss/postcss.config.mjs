import autoprefixer from 'autoprefixer';
import env from 'postcss-preset-env';
import tailwindcss from 'tailwindcss';

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        tailwindcss,
        autoprefixer,
        env({
            features: {
                'color-functional-notation': true,
                'hexadecimal-alpha-notation': true,
            },
        }),
    ],
};

export default config;
