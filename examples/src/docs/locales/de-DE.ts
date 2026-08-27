import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/de-DE';
import drawing from '@univerjs/preset-docs-drawing/locales/de-DE';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/de-DE';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/de-DE';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
