import type { Plugin } from 'vite';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const DEV_LOCALE_ENDPOINT = '/__univer_examples_locale';
const DEV_LOCALE_EXPORT_SCRIPT = fileURLToPath(new URL('./scripts/export-locale.mts', import.meta.url));
const DEV_LOCALE_PRODUCTS = new Set(['docs', 'sheets', 'slides']);
const DEV_TSX_IMPORT = fileURLToPath(import.meta.resolve('tsx'));
const DEV_LOCALE_TAGS = new Set([
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
type DevLocaleProduct = 'docs' | 'sheets' | 'slides';

const VIRTUAL_LOCALE_MODULES = {
    'virtual:univer-examples-document-locale': {
        development: fileURLToPath(new URL('./src/docs/locale-loader.dev.ts', import.meta.url)),
        exportName: 'loadDocumentLocale',
        production: fileURLToPath(new URL('./src/docs/locale-loader.ts', import.meta.url)),
    },
    'virtual:univer-examples-sheet-locale': {
        development: fileURLToPath(new URL('./src/sheets/locale-loader.dev.ts', import.meta.url)),
        exportName: 'loadSheetLocale',
        production: fileURLToPath(new URL('./src/sheets/locale-loader.ts', import.meta.url)),
    },
    'virtual:univer-examples-slide-locale': {
        development: fileURLToPath(new URL('./src/slides/locale-loader.dev.ts', import.meta.url)),
        exportName: 'loadSlideLocale',
        production: fileURLToPath(new URL('./src/slides/locale-loader.ts', import.meta.url)),
    },
} as const;

type VirtualLocaleModule = keyof typeof VIRTUAL_LOCALE_MODULES;

function isDevLocaleProduct(value: string | null): value is DevLocaleProduct {
    return value !== null && DEV_LOCALE_PRODUCTS.has(value);
}

function isVirtualLocaleModule(value: string): value is VirtualLocaleModule {
    return Object.hasOwn(VIRTUAL_LOCALE_MODULES, value);
}

function exportDevLocale(product: DevLocaleProduct, locale: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn(
            process.execPath,
            ['--import', DEV_TSX_IMPORT, DEV_LOCALE_EXPORT_SCRIPT, product, locale],
            {
                env: { ...process.env, NODE_NO_WARNINGS: '1' },
                stdio: ['ignore', 'pipe', 'pipe'],
            }
        );
        let output = '';
        let errorOutput = '';

        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk: string) => {
            output += chunk;
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk: string) => {
            errorOutput += chunk;
        });
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve(output);
                return;
            }

            reject(new Error(errorOutput.trim() || `Locale exporter exited with code ${code}.`));
        });
    });
}

/**
 * bundledDev follows every literal locale import. During development, load the
 * requested locale in a short-lived process so the other locale graphs never
 * become resident in Vite. Production keeps the regular static locale chunks.
 */
function workbenchLocaleLoader(command: 'build' | 'serve'): Plugin {
    const cache = new Map<string, Promise<string>>();

    return {
        name: 'workbench-locale-loader',
        resolveId(source) {
            return isVirtualLocaleModule(source) ? `\0${source}` : null;
        },
        load(id) {
            const source = id.startsWith('\0') ? id.slice(1) : id;
            if (!isVirtualLocaleModule(source)) {
                return null;
            }

            const localeModule = VIRTUAL_LOCALE_MODULES[source];
            const implementation = command === 'serve' ? localeModule.development : localeModule.production;
            return `export { ${localeModule.exportName} } from ${JSON.stringify(implementation)};`;
        },
        configureServer(server) {
            server.watcher.on('change', (file) => {
                if (/\/src\/locales?\//.test(file)) {
                    cache.clear();
                }
            });
            server.middlewares.use(async (request, response, next) => {
                if (!request.url) {
                    next();
                    return;
                }

                const requestUrl = new URL(request.url, 'http://localhost');
                if (requestUrl.pathname !== DEV_LOCALE_ENDPOINT) {
                    next();
                    return;
                }

                const product = requestUrl.searchParams.get('product');
                const locale = requestUrl.searchParams.get('locale');
                if (!isDevLocaleProduct(product) || !locale || !DEV_LOCALE_TAGS.has(locale)) {
                    response.statusCode = 400;
                    response.setHeader('content-type', 'application/json; charset=utf-8');
                    response.end(JSON.stringify({ error: 'Unsupported product or locale.' }));
                    return;
                }

                try {
                    const cacheKey = `${product}:${locale}`;
                    let localeData = cache.get(cacheKey);
                    if (!localeData) {
                        localeData = exportDevLocale(product, locale).catch((error) => {
                            cache.delete(cacheKey);
                            throw error;
                        });
                        cache.set(cacheKey, localeData);
                    }

                    response.statusCode = 200;
                    response.setHeader('cache-control', 'no-store');
                    response.setHeader('content-type', 'application/json; charset=utf-8');
                    response.end(await localeData);
                } catch (error) {
                    response.statusCode = 500;
                    response.setHeader('content-type', 'application/json; charset=utf-8');
                    response.end(JSON.stringify({
                        error: error instanceof Error ? error.message : String(error),
                    }));
                }
            });
        },
    };
}

function ignoreWorkspaceGlobalCss(): Plugin {
    return {
        name: 'ignore-workspace-global-css',
        enforce: 'pre',
        transform: {
            filter: { id: /\/packages\/.*\/src\/global\.css$/ },
            handler() {
                return '';
            },
        },
    };
}

export default defineConfig(({ command, mode }) => ({
    build: {
        sourcemap: false,
    },
    experimental: {
        bundledDev: command === 'serve' && mode !== 'test',
    },
    plugins: [workbenchLocaleLoader(command), ignoreWorkspaceGlobalCss()],
    preview: {
        port: 5173,
        strictPort: true,
    },
    server: {
        port: 5173,
        strictPort: true,
    },
}));
