import autoprefixer from 'autoprefixer';
import env from 'postcss-preset-env';
import replace from 'postcss-replace';
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
        replace({
            pattern: /(--tw|\*)/g,
            data: {
                '--tw': '--univer-tw',
            },
        }),
    ],
};

export default config;
