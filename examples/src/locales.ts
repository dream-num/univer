/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Tools } from '@univerjs/core';
import { enUS as DesignEnUS, ruRU as DesignRuRU, zhCN as DesignZhCN } from '@univerjs/design/locale';
import { enUS as DocsUIEnUS, ruRU as DocsUIRuRU, zhCN as DocsUIZhCN } from '@univerjs/docs-ui/locale';
import { enUS as SheetsEnUS, ruRU as SheetsRuRU, zhCN as SheetsZhCN } from '@univerjs/sheets/locale';
import { enUS as SheetsUIEnUS, ruRU as SheetsUIRuRU, zhCN as SheetsUIZhCN } from '@univerjs/sheets-ui/locale';
import { enUS as FindReplaceEnUS, ruRU as FindReplaceRuRU, zhCN as FindReplaceZhCN } from '@univerjs/find-replace/locale';
import { enUS as SheetsFormulaEnUS, ruRU as SheetsFormulaRuRU, zhCN as SheetsFormulaZhCN } from '@univerjs/sheets-formula/locale';
import { enUS as SheetsDataValidationEnUS, ruRU as SheetsDataValidationRuRU, zhCN as SheetsDataValidationZhCN } from '@univerjs/sheets-data-validation/locale';
import { enUS as SheetsConditionalFormattingUIEnUS, ruRU as SheetsConditionalFormattingUIRuRU, zhCN as SheetsConditionalFormattingUIZhCN } from '@univerjs/sheets-conditional-formatting-ui/locale';
import { enUS as SheetsZenEditorEnUS, ruRU as SheetsZenEditorRuRU, zhCN as SheetsZenEditorZhCN } from '@univerjs/sheets-zen-editor/locale';
import { enUS as UIEnUS, ruRU as UIRuRU, zhCN as UIZhCN } from '@univerjs/ui/locale';
import { enUS as SheetsFilterUIEnUS, ruRU as SheetsFilterUIRuRU, zhCN as SheetsFilterUIZhCN } from '@univerjs/sheets-filter-ui/locale';
import { enUS as SheetsThreadCommentEnUS, ruRU as SheetsThreadCommentRuRU, zhCN as SheetsThreadCommentZhCN } from '@univerjs/sheets-thread-comment/locale';
import { enUS as ThreadCommentUIEnUS, ruRU as ThreadCommentUIRuRU, zhCN as ThreadCommentUIZhCN } from '@univerjs/thread-comment-ui/locale';
import { enUS as SheetsNumfmtEnUS, ruRU as SheetsNumfmtRuRU, zhCN as SheetsNumfmtZhCN } from '@univerjs/sheets-numfmt/locale';
import { enUS as UniscriptEnUS, ruRU as UniscriptRuRU, zhCN as UniscriptZhCN } from '@univerjs/uniscript/locale';

export const zhCN = Tools.deepMerge(
    SheetsZhCN,
    DocsUIZhCN,
    FindReplaceZhCN,
    SheetsUIZhCN,
    SheetsFormulaZhCN,
    SheetsDataValidationZhCN,
    SheetsConditionalFormattingUIZhCN,
    SheetsZenEditorZhCN,
    UIZhCN,
    DesignZhCN,
    SheetsFilterUIZhCN,
    SheetsThreadCommentZhCN,
    ThreadCommentUIZhCN,
    SheetsNumfmtZhCN,
    UniscriptZhCN
);

export const enUS = Tools.deepMerge(
    SheetsEnUS,
    DocsUIEnUS,
    FindReplaceEnUS,
    SheetsUIEnUS,
    SheetsFormulaEnUS,
    SheetsDataValidationEnUS,
    SheetsConditionalFormattingUIEnUS,
    SheetsZenEditorEnUS,
    UIEnUS,
    DesignEnUS,
    SheetsFilterUIEnUS,
    SheetsThreadCommentEnUS,
    ThreadCommentUIEnUS,
    SheetsNumfmtEnUS,
    UniscriptEnUS
);

export const ruRU = Tools.deepMerge(
    SheetsRuRU,
    DocsUIRuRU,
    FindReplaceRuRU,
    SheetsUIRuRU,
    SheetsFormulaRuRU,
    SheetsDataValidationRuRU,
    SheetsConditionalFormattingUIRuRU,
    SheetsZenEditorRuRU,
    UIRuRU,
    DesignRuRU,
    SheetsFilterUIRuRU,
    SheetsThreadCommentRuRU,
    ThreadCommentUIRuRU,
    SheetsNumfmtRuRU,
    UniscriptRuRU
);
