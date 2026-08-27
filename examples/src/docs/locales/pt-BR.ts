import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/pt-BR';
import drawing from '@univerjs/preset-docs-drawing/locales/pt-BR';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/pt-BR';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/pt-BR';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
