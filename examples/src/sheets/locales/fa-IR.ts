import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/fa-IR';
import core from '@univerjs/preset-sheets-core/locales/fa-IR';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/fa-IR';
import drawing from '@univerjs/preset-sheets-drawing/locales/fa-IR';
import filter from '@univerjs/preset-sheets-filter/locales/fa-IR';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/fa-IR';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/fa-IR';
import note from '@univerjs/preset-sheets-note/locales/fa-IR';
import sort from '@univerjs/preset-sheets-sort/locales/fa-IR';
import table from '@univerjs/preset-sheets-table/locales/fa-IR';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/fa-IR';

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
