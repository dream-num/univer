import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({}, {
    mode,
    pkg,
    features: {
        react: true,
        css: true,
        dom: true,
    },
});
