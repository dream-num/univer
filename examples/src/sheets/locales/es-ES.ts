import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/es-ES';
import core from '@univerjs/preset-sheets-core/locales/es-ES';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/es-ES';
import drawing from '@univerjs/preset-sheets-drawing/locales/es-ES';
import filter from '@univerjs/preset-sheets-filter/locales/es-ES';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/es-ES';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/es-ES';
import note from '@univerjs/preset-sheets-note/locales/es-ES';
import sort from '@univerjs/preset-sheets-sort/locales/es-ES';
import table from '@univerjs/preset-sheets-table/locales/es-ES';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/es-ES';

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
