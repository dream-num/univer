import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/zh-HK';
import core from '@univerjs/preset-sheets-core/locales/zh-HK';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/zh-HK';
import drawing from '@univerjs/preset-sheets-drawing/locales/zh-HK';
import filter from '@univerjs/preset-sheets-filter/locales/zh-HK';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/zh-HK';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/zh-HK';
import note from '@univerjs/preset-sheets-note/locales/zh-HK';
import sort from '@univerjs/preset-sheets-sort/locales/zh-HK';
import table from '@univerjs/preset-sheets-table/locales/zh-HK';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/zh-HK';

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
