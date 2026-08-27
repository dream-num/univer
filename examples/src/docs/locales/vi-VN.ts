import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/vi-VN';
import drawing from '@univerjs/preset-docs-drawing/locales/vi-VN';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/vi-VN';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/vi-VN';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
