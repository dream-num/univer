import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/zh-HK';
import drawing from '@univerjs/preset-docs-drawing/locales/zh-HK';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/zh-HK';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/zh-HK';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
