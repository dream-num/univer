import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/zh-TW';
import drawing from '@univerjs/preset-docs-drawing/locales/zh-TW';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/zh-TW';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/zh-TW';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
