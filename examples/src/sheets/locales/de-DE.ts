import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/de-DE';
import core from '@univerjs/preset-sheets-core/locales/de-DE';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/de-DE';
import drawing from '@univerjs/preset-sheets-drawing/locales/de-DE';
import filter from '@univerjs/preset-sheets-filter/locales/de-DE';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/de-DE';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/de-DE';
import note from '@univerjs/preset-sheets-note/locales/de-DE';
import sort from '@univerjs/preset-sheets-sort/locales/de-DE';
import table from '@univerjs/preset-sheets-table/locales/de-DE';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/de-DE';

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
