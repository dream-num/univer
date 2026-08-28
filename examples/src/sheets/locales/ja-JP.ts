import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/ja-JP';
import core from '@univerjs/preset-sheets-core/locales/ja-JP';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/ja-JP';
import drawing from '@univerjs/preset-sheets-drawing/locales/ja-JP';
import filter from '@univerjs/preset-sheets-filter/locales/ja-JP';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/ja-JP';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/ja-JP';
import note from '@univerjs/preset-sheets-note/locales/ja-JP';
import sort from '@univerjs/preset-sheets-sort/locales/ja-JP';
import table from '@univerjs/preset-sheets-table/locales/ja-JP';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/ja-JP';

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
