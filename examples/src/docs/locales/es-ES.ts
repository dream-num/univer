import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/es-ES';
import drawing from '@univerjs/preset-docs-drawing/locales/es-ES';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/es-ES';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/es-ES';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
