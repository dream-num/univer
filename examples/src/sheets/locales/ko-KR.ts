import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/ko-KR';
import core from '@univerjs/preset-sheets-core/locales/ko-KR';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/ko-KR';
import drawing from '@univerjs/preset-sheets-drawing/locales/ko-KR';
import filter from '@univerjs/preset-sheets-filter/locales/ko-KR';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/ko-KR';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/ko-KR';
import note from '@univerjs/preset-sheets-note/locales/ko-KR';
import sort from '@univerjs/preset-sheets-sort/locales/ko-KR';
import table from '@univerjs/preset-sheets-table/locales/ko-KR';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/ko-KR';

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
