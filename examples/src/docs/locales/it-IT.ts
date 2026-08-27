import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/it-IT';
import drawing from '@univerjs/preset-docs-drawing/locales/it-IT';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/it-IT';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/it-IT';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
