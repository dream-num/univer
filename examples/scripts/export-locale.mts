import process from 'node:process';

interface ILocaleModule {
    default?: unknown;
}

const LOCALE_SOURCES = {
    docs: {
        directory: 'locales',
        packages: [
            '@univerjs/preset-docs-core',
            '@univerjs/preset-docs-drawing',
            '@univerjs/preset-docs-hyper-link',
            '@univerjs/preset-docs-thread-comment',
        ],
    },
    sheets: {
        directory: 'locales',
        packages: [
            '@univerjs/preset-sheets-core',
            '@univerjs/preset-sheets-drawing',
            '@univerjs/preset-sheets-conditional-formatting',
            '@univerjs/preset-sheets-data-validation',
            '@univerjs/preset-sheets-filter',
            '@univerjs/preset-sheets-find-replace',
            '@univerjs/preset-sheets-hyper-link',
            '@univerjs/preset-sheets-note',
            '@univerjs/preset-sheets-sort',
            '@univerjs/preset-sheets-table',
            '@univerjs/preset-sheets-thread-comment',
        ],
    },
    slides: {
        directory: 'locale',
        packages: [
            '@univerjs/design',
            '@univerjs/docs-ui',
            '@univerjs/slides-ui',
            '@univerjs/ui',
        ],
    },
} as const;

const LOCALE_TAGS = new Set([
    'ar-SA',
    'ca-ES',
    'de-DE',
    'en-US',
    'es-ES',
    'fa-IR',
    'fr-FR',
    'id-ID',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'pl-PL',
    'pt-BR',
    'ru-RU',
    'sk-SK',
    'vi-VN',
    'zh-CN',
    'zh-HK',
    'zh-TW',
]);

type LocaleProduct = keyof typeof LOCALE_SOURCES;

function isLocaleProduct(value: string | undefined): value is LocaleProduct {
    return value !== undefined && Object.hasOwn(LOCALE_SOURCES, value);
}

function unwrapDefault(module: ILocaleModule): unknown {
    let value = module.default;
    while (
        value !== null
        && typeof value === 'object'
        && !Array.isArray(value)
        && Object.keys(value).length === 1
        && Object.hasOwn(value, 'default')
    ) {
        value = (value as { default: unknown }).default;
    }
    return value;
}

const [product, locale] = process.argv.slice(2);
if (!isLocaleProduct(product) || !locale || !LOCALE_TAGS.has(locale)) {
    throw new Error('Unsupported product or locale.');
}

const source = LOCALE_SOURCES[product];
const packs = await Promise.all(source.packages.map(async (packageName) => {
    const module = await import(`${packageName}/${source.directory}/${locale}`) as ILocaleModule;
    return unwrapDefault(module);
}));

process.stdout.write(JSON.stringify({ packs }));
