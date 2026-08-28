import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/en-US';
import drawing from '@univerjs/preset-docs-drawing/locales/en-US';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/en-US';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/en-US';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
