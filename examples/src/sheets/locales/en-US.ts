import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/en-US';
import core from '@univerjs/preset-sheets-core/locales/en-US';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/en-US';
import drawing from '@univerjs/preset-sheets-drawing/locales/en-US';
import filter from '@univerjs/preset-sheets-filter/locales/en-US';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/en-US';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/en-US';
import note from '@univerjs/preset-sheets-note/locales/en-US';
import sort from '@univerjs/preset-sheets-sort/locales/en-US';
import table from '@univerjs/preset-sheets-table/locales/en-US';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/en-US';

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
