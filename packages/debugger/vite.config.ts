import vue from '@vitejs/plugin-vue';
import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    plugins: [vue()],
}, {
    mode,
    pkg,
    features: {
        react: true,
        css: true,
        dom: true,
        vue: true,
    },
});

