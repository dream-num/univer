export const peerDepsMap = {
    react: {
        global: 'React',
        name: 'react',
        version: '^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc',
    },
    'react/jsx-runtime': {
        global: 'React',
        name: 'react',
        version: 'react',
    },
    'react-dom': {
        global: 'ReactDOM',
        name: 'react-dom',
        version: '^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc',
    },
    'react-dom/client': {
        global: 'ReactDOM',
        name: 'react-dom',
        version: 'react-dom',
    },
    rxjs: {
        global: 'rxjs',
        name: 'rxjs',
        version: '>=7.0.0',
    },
    'rxjs/operators': {
        global: 'rxjs.operators',
        name: 'rxjs',
        version: 'rxjs',
    },
    '@wendellhu/redi': {
        global: '@wendellhu/redi',
        name: '@wendellhu/redi',
        version: '1.1.2',
    },
    '@wendellhu/redi/react-bindings': {
        global: '@wendellhu/redi/react-bindings',
        name: '@wendellhu/redi',
        version: '@wendellhu/redi',
    },
    vue: {
        global: 'Vue',
        name: 'vue',
        version: '>=3.0.0',
    },
} as const;
