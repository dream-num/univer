import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/ca-ES';
import core from '@univerjs/preset-sheets-core/locales/ca-ES';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/ca-ES';
import drawing from '@univerjs/preset-sheets-drawing/locales/ca-ES';
import filter from '@univerjs/preset-sheets-filter/locales/ca-ES';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/ca-ES';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/ca-ES';
import note from '@univerjs/preset-sheets-note/locales/ca-ES';
import sort from '@univerjs/preset-sheets-sort/locales/ca-ES';
import table from '@univerjs/preset-sheets-table/locales/ca-ES';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/ca-ES';

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
