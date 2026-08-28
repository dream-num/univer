import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN';
import core from '@univerjs/preset-sheets-core/locales/zh-CN';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/zh-CN';
import drawing from '@univerjs/preset-sheets-drawing/locales/zh-CN';
import filter from '@univerjs/preset-sheets-filter/locales/zh-CN';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/zh-CN';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/zh-CN';
import note from '@univerjs/preset-sheets-note/locales/zh-CN';
import sort from '@univerjs/preset-sheets-sort/locales/zh-CN';
import table from '@univerjs/preset-sheets-table/locales/zh-CN';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/zh-CN';

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
