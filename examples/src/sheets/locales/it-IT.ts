import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/it-IT';
import core from '@univerjs/preset-sheets-core/locales/it-IT';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/it-IT';
import drawing from '@univerjs/preset-sheets-drawing/locales/it-IT';
import filter from '@univerjs/preset-sheets-filter/locales/it-IT';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/it-IT';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/it-IT';
import note from '@univerjs/preset-sheets-note/locales/it-IT';
import sort from '@univerjs/preset-sheets-sort/locales/it-IT';
import table from '@univerjs/preset-sheets-table/locales/it-IT';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/it-IT';

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
