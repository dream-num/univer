import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/sk-SK';
import core from '@univerjs/preset-sheets-core/locales/sk-SK';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/sk-SK';
import drawing from '@univerjs/preset-sheets-drawing/locales/sk-SK';
import filter from '@univerjs/preset-sheets-filter/locales/sk-SK';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/sk-SK';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/sk-SK';
import note from '@univerjs/preset-sheets-note/locales/sk-SK';
import sort from '@univerjs/preset-sheets-sort/locales/sk-SK';
import table from '@univerjs/preset-sheets-table/locales/sk-SK';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/sk-SK';

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
