import createViteConfig from '@univerjs-infra/shared/vite';
import vue from '@vitejs/plugin-vue';
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

