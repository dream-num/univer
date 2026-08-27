import { mergeLocales } from '@univerjs/core';
import core from '@univerjs/preset-docs-core/locales/fr-FR';
import drawing from '@univerjs/preset-docs-drawing/locales/fr-FR';
import hyperLink from '@univerjs/preset-docs-hyper-link/locales/fr-FR';
import threadComment from '@univerjs/preset-docs-thread-comment/locales/fr-FR';

export default mergeLocales(
    core,
    drawing,
    hyperLink,
    threadComment
);
