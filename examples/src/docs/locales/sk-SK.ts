import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/sk-SK';
import drawing from '@univerjs/preset-docs-drawing/locales/sk-SK';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/sk-SK';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/sk-SK';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
