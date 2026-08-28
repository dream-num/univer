import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/ca-ES';
import drawing from '@univerjs/preset-docs-drawing/locales/ca-ES';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/ca-ES';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/ca-ES';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
