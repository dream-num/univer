import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/vi-VN';
import core from '@univerjs/preset-sheets-core/locales/vi-VN';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/vi-VN';
import drawing from '@univerjs/preset-sheets-drawing/locales/vi-VN';
import filter from '@univerjs/preset-sheets-filter/locales/vi-VN';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/vi-VN';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/vi-VN';
import note from '@univerjs/preset-sheets-note/locales/vi-VN';
import sort from '@univerjs/preset-sheets-sort/locales/vi-VN';
import table from '@univerjs/preset-sheets-table/locales/vi-VN';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/vi-VN';

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
