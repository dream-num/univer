import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/fa-IR';
import drawing from '@univerjs/preset-docs-drawing/locales/fa-IR';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/fa-IR';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/fa-IR';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
