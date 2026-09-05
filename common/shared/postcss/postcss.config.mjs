import autoprefixer from 'autoprefixer';
import env from 'postcss-preset-env';
import replace from 'postcss-replace';
import tailwindcss from 'tailwindcss';

const univerRootSelector = ':where([data-univer-root], [data-univer-root] *, [class*="univer-"])';
const scopedUniversalSelectors = new Map([
    ['*', univerRootSelector],
    ['::before', `${univerRootSelector}::before`],
    ['::after', `${univerRootSelector}::after`],
    ['::backdrop', `${univerRootSelector}::backdrop`],
]);
const scopeUniverUniversalStyles = {
    postcssPlugin: 'scope-univer-universal-styles',
    Rule(rule) {
        const selectors = rule.selectors?.map((selector) => scopedUniversalSelectors.get(selector));
        if (!selectors || selectors.some((selector) => selector == null)) {
            return;
        }

        rule.selectors = selectors;
    },
};

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        tailwindcss,
        scopeUniverUniversalStyles,
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
