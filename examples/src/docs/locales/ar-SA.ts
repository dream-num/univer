import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/ar-SA';
import drawing from '@univerjs/preset-docs-drawing/locales/ar-SA';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/ar-SA';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/ar-SA';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
