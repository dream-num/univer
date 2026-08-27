import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/fr-FR';
import core from '@univerjs/preset-sheets-core/locales/fr-FR';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/fr-FR';
import drawing from '@univerjs/preset-sheets-drawing/locales/fr-FR';
import filter from '@univerjs/preset-sheets-filter/locales/fr-FR';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/fr-FR';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/fr-FR';
import note from '@univerjs/preset-sheets-note/locales/fr-FR';
import sort from '@univerjs/preset-sheets-sort/locales/fr-FR';
import table from '@univerjs/preset-sheets-table/locales/fr-FR';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/fr-FR';

export default mergeLocales(
    core,
    drawing,
    conditionalFormatting,
    dataValidation,
    filter,
    findReplace,
    hyperLink,
    note,
    sort,
    table,
    threadComment
);
