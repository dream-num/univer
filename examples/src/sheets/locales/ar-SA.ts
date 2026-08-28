import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/ar-SA';
import core from '@univerjs/preset-sheets-core/locales/ar-SA';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/ar-SA';
import drawing from '@univerjs/preset-sheets-drawing/locales/ar-SA';
import filter from '@univerjs/preset-sheets-filter/locales/ar-SA';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/ar-SA';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/ar-SA';
import note from '@univerjs/preset-sheets-note/locales/ar-SA';
import sort from '@univerjs/preset-sheets-sort/locales/ar-SA';
import table from '@univerjs/preset-sheets-table/locales/ar-SA';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/ar-SA';

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
