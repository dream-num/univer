import { mergeLocales } from '@univerjs/core';
import conditionalFormatting from '@univerjs/preset-sheets-conditional-formatting/locales/pt-BR';
import core from '@univerjs/preset-sheets-core/locales/pt-BR';
import dataValidation from '@univerjs/preset-sheets-data-validation/locales/pt-BR';
import drawing from '@univerjs/preset-sheets-drawing/locales/pt-BR';
import filter from '@univerjs/preset-sheets-filter/locales/pt-BR';
import findReplace from '@univerjs/preset-sheets-find-replace/locales/pt-BR';
import hyperLink from '@univerjs/preset-sheets-hyper-link/locales/pt-BR';
import note from '@univerjs/preset-sheets-note/locales/pt-BR';
import sort from '@univerjs/preset-sheets-sort/locales/pt-BR';
import table from '@univerjs/preset-sheets-table/locales/pt-BR';
import threadComment from '@univerjs/preset-sheets-thread-comment/locales/pt-BR';

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
