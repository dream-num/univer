import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/ko-KR';
import drawing from '@univerjs/preset-docs-drawing/locales/ko-KR';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/ko-KR';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/ko-KR';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
