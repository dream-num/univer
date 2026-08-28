import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/pl-PL';
import core from '@univerjs/preset-sheets-core/locales/pl-PL';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/pl-PL';
import drawing from '@univerjs/preset-sheets-drawing/locales/pl-PL';
import filter from '@univerjs/preset-sheets-filter/locales/pl-PL';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/pl-PL';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/pl-PL';
import note from '@univerjs/preset-sheets-note/locales/pl-PL';
import sort from '@univerjs/preset-sheets-sort/locales/pl-PL';
import table from '@univerjs/preset-sheets-table/locales/pl-PL';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/pl-PL';

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
