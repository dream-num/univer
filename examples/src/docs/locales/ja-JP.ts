import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/ja-JP';
import drawing from '@univerjs/preset-docs-drawing/locales/ja-JP';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/ja-JP';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/ja-JP';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
