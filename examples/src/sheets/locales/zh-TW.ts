import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/zh-TW';
import core from '@univerjs/preset-sheets-core/locales/zh-TW';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/zh-TW';
import drawing from '@univerjs/preset-sheets-drawing/locales/zh-TW';
import filter from '@univerjs/preset-sheets-filter/locales/zh-TW';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/zh-TW';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/zh-TW';
import note from '@univerjs/preset-sheets-note/locales/zh-TW';
import sort from '@univerjs/preset-sheets-sort/locales/zh-TW';
import table from '@univerjs/preset-sheets-table/locales/zh-TW';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/zh-TW';

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
