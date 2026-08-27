import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/id-ID';
import drawing from '@univerjs/preset-docs-drawing/locales/id-ID';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/id-ID';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/id-ID';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
