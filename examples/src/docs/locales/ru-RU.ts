import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/ru-RU';
import drawing from '@univerjs/preset-docs-drawing/locales/ru-RU';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/ru-RU';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/ru-RU';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
