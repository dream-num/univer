import createViteConfig from '@univerjs-infra/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({}, {
    mode,
    pkg,
});
