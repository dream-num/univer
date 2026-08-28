import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/id-ID';
import core from '@univerjs/preset-sheets-core/locales/id-ID';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/id-ID';
import drawing from '@univerjs/preset-sheets-drawing/locales/id-ID';
import filter from '@univerjs/preset-sheets-filter/locales/id-ID';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/id-ID';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/id-ID';
import note from '@univerjs/preset-sheets-note/locales/id-ID';
import sort from '@univerjs/preset-sheets-sort/locales/id-ID';
import table from '@univerjs/preset-sheets-table/locales/id-ID';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/id-ID';

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
