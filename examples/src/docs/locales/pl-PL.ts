import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/pl-PL';
import drawing from '@univerjs/preset-docs-drawing/locales/pl-PL';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/pl-PL';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/pl-PL';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
