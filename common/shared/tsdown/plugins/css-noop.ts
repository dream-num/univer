import type { UserConfig } from 'tsdown';

const CSS_NOOP_PLUGIN_NAME = 'univer-css-noop';
const CSS_IMPORT_RE = /\.(?:css|less|sass|scss|styl|stylus)(?:$|\?)/;
const CSS_NOOP_ID_PREFIX = '\0univer-css-noop:';
const CSS_NOOP_ID_RE = /^\0univer-css-noop:/;

type TInputOptions = NonNullable<UserConfig['inputOptions']>;
type TInputOptionsFunction = Extract<TInputOptions, (...args: any[]) => any>;
type TInputOptionsObject = Exclude<TInputOptions, (...args: any[]) => any>;

function toPluginArray(plugins: unknown): any[] {
    return Array.isArray(plugins)
        ? plugins
        : plugins
            ? [plugins]
            : [];
}

function withoutCssNoopPlugin(plugins: any[]) {
    return plugins.filter((plugin) => !plugin || plugin.name !== CSS_NOOP_PLUGIN_NAME);
}

export function createCssNoopPlugin() {
    let nextId = 0;

    return {
        name: CSS_NOOP_PLUGIN_NAME,
        resolveId: {
            filter: { id: CSS_IMPORT_RE },
            handler() {
                return `${CSS_NOOP_ID_PREFIX}${nextId++}`;
            },
        },
        load: {
            filter: { id: CSS_NOOP_ID_RE },
            handler() {
                return {
                    code: 'export default {};',
                    moduleSideEffects: false,
                    moduleType: 'js',
                };
            },
        },
    };
}

function prependCssNoopPlugin(plugins: any[]) {
    return [
        createCssNoopPlugin(),
        ...withoutCssNoopPlugin(plugins),
    ];
}

export function createCssNoopInputOptions(inputOptions?: TInputOptions): TInputOptionsFunction {
    return (async (defaultOptions: { plugins?: unknown }, ...args: any[]) => {
        const defaultPlugins = toPluginArray(defaultOptions.plugins);

        if (!inputOptions) {
            return {
                plugins: prependCssNoopPlugin(defaultPlugins),
            };
        }

        if (typeof inputOptions === 'function') {
            const defaultOptionsWithCssNoop = {
                ...defaultOptions,
                plugins: prependCssNoopPlugin(defaultPlugins),
            };
            const resolvedOptions = await (inputOptions as any)(defaultOptionsWithCssNoop, ...args);

            if (!resolvedOptions) {
                return defaultOptionsWithCssNoop;
            }

            return {
                ...resolvedOptions,
                plugins: prependCssNoopPlugin(toPluginArray(resolvedOptions.plugins ?? defaultOptionsWithCssNoop.plugins)),
            };
        }

        const inputOptionsObject = inputOptions as TInputOptionsObject & { plugins?: unknown };

        return {
            ...inputOptionsObject,
            plugins: prependCssNoopPlugin([
                ...toPluginArray(inputOptionsObject.plugins),
                ...defaultPlugins,
            ]),
        };
    }) as TInputOptionsFunction;
}
