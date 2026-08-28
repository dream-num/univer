import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/ru-RU';
import core from '@univerjs/preset-sheets-core/locales/ru-RU';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/ru-RU';
import drawing from '@univerjs/preset-sheets-drawing/locales/ru-RU';
import filter from '@univerjs/preset-sheets-filter/locales/ru-RU';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/ru-RU';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/ru-RU';
import note from '@univerjs/preset-sheets-note/locales/ru-RU';
import sort from '@univerjs/preset-sheets-sort/locales/ru-RU';
import table from '@univerjs/preset-sheets-table/locales/ru-RU';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/ru-RU';

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
