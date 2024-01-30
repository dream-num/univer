import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: ['clsx', 'react', 'react-dom', 'rxjs'],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    clsx: 'clsx',
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    rxjs: 'rxjs',
                },
            },
        },
    },
}, {
    mode,
    pkg,
    features: {
        react: false,
        css: true,
        dom: true,
    },
});
