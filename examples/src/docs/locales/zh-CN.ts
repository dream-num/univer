import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/zh-CN';
import drawing from '@univerjs/preset-docs-drawing/locales/zh-CN';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/zh-CN';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/zh-CN';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
