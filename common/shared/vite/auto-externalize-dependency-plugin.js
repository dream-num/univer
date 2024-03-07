const { convertLibNameFromPackageName } = require('./utils');

exports.autoExternalizeDependency = function autoExternalizeDependency() {
    const externals = new Set();
    const globals = {};
    let hasCss = false;

    const externalMap = {
        '@wendellhu/redi': '@wendellhu/redi',
        '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
        clsx: 'clsx',
        'lodash/debounce': 'lodash.debounce',
        'monaco-editor': 'monaco',
        react: 'React',
        'react-dom': 'ReactDOM',
        rxjs: 'rxjs',
        'rxjs/operators': 'rxjs.operators',
        vue: 'Vue',
    };

    return {
        name: 'auto-detected-external',
        enforce: 'pre',
        apply: 'build',

        resolveId(source) {
            if (source.endsWith('.less') || source.endsWith('.css')) {
                hasCss = true;
            }

            if (source in externalMap) {
                externals.add(source);
                globals[source] = externalMap[source];

                return { id: source, external: true };
            } else if (source.startsWith('@univerjs') && source !== '@univerjs/icons') {
                externals.add(source);

                globals[source] = convertLibNameFromPackageName(source);

                return { id: source, external: true };
            }

            return null;
        },

        outputOptions(opts) {
            opts.globals = globals;

            if (hasCss) {
                opts.assetFileNames = 'index.css';
            }

            return opts;
        },

        generateBundle() {
            // console.log('Auto-detected external modules:', Array.from(externals));
            // console.log('Auto-detected globals:', globals);
        },
    };
};
