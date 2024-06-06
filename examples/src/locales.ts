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
import DesignEnUS from '@univerjs/design/locale/en-US';
import DesignRuRU from '@univerjs/design/locale/ru-RU';
import DesignZhCN from '@univerjs/design/locale/zh-CN';
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US';
import DocsUIRuRU from '@univerjs/docs-ui/locale/ru-RU';
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN';
import FindReplaceEnUS from '@univerjs/find-replace/locale/en-US';
import FindReplaceRuRU from '@univerjs/find-replace/locale/ru-RU';
import FindReplaceZhCN from '@univerjs/find-replace/locale/zh-CN';
import SheetsFindReplaceEnUS from '@univerjs/sheets-find-replace/locale/en-US';
import SheetsFindReplaceRuRU from '@univerjs/sheets-find-replace/locale/ru-RU';
import SheetsFindReplaceZhCN from '@univerjs/sheets-find-replace/locale/zh-CN';
import SheetsEnUS from '@univerjs/sheets/locale/en-US';
import SheetsRuRU from '@univerjs/sheets/locale/ru-RU';
import SheetsZhCN from '@univerjs/sheets/locale/zh-CN';
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US';
import SheetsUIRuRU from '@univerjs/sheets-ui/locale/ru-RU';
import SheetsUIZhCN from '@univerjs/sheets-ui/locale/zh-CN';
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US';
import SheetsFormulaRuRU from '@univerjs/sheets-formula/locale/ru-RU';
import SheetsFormulaZhCN from '@univerjs/sheets-formula/locale/zh-CN';
import SheetsDataValidationEnUS from '@univerjs/sheets-data-validation/locale/en-US';
import SheetsDataValidationRuRU from '@univerjs/sheets-data-validation/locale/ru-RU';
import SheetsDataValidationZhCN from '@univerjs/sheets-data-validation/locale/zh-CN';
import SheetsConditionalFormattingUIEnUS from '@univerjs/sheets-conditional-formatting-ui/locale/en-US';
import SheetsConditionalFormattingUIRuRU from '@univerjs/sheets-conditional-formatting-ui/locale/ru-RU';
import SheetsConditionalFormattingUIZhCN from '@univerjs/sheets-conditional-formatting-ui/locale/zh-CN';
import SheetsZenEditorEnUS from '@univerjs/sheets-zen-editor/locale/en-US';
import SheetsZenEditorRuRU from '@univerjs/sheets-zen-editor/locale/ru-RU';
import SheetsZenEditorZhCN from '@univerjs/sheets-zen-editor/locale/zh-CN';
import UIEnUS from '@univerjs/ui/locale/en-US';
import UIRuRU from '@univerjs/ui/locale/ru-RU';
import UIZhCN from '@univerjs/ui/locale/zh-CN';
import SheetsFilterUIEnUS from '@univerjs/sheets-filter-ui/locale/en-US';
import SheetsFilterUIRuRU from '@univerjs/sheets-filter-ui/locale/ru-RU';
import SheetsFilterUIZhCN from '@univerjs/sheets-filter-ui/locale/zh-CN';
import SheetsThreadCommentEnUS from '@univerjs/sheets-thread-comment/locale/en-US';
import SheetsThreadCommentRuRU from '@univerjs/sheets-thread-comment/locale/ru-RU';
import SheetsThreadCommentZhCN from '@univerjs/sheets-thread-comment/locale/zh-CN';
import ThreadCommentUIEnUS from '@univerjs/thread-comment-ui/locale/en-US';
import ThreadCommentUIRuRU from '@univerjs/thread-comment-ui/locale/ru-RU';
import ThreadCommentUIZhCN from '@univerjs/thread-comment-ui/locale/zh-CN';
import SheetsNumfmtEnUS from '@univerjs/sheets-numfmt/locale/en-US';
import SheetsNumfmtRuRU from '@univerjs/sheets-numfmt/locale/ru-RU';
import SheetsNumfmtZhCN from '@univerjs/sheets-numfmt/locale/zh-CN';
import UniscriptEnUS from '@univerjs/uniscript/locale/en-US';
import UniscriptRuRU from '@univerjs/uniscript/locale/ru-RU';
import UniscriptZhCN from '@univerjs/uniscript/locale/zh-CN';
import SheetsHyperLinkUIEnUS from '@univerjs/sheets-hyper-link-ui/locale/en-US';
import SheetsHyperLinkUIRuRU from '@univerjs/sheets-hyper-link-ui/locale/ru-RU';
import SheetsHyperLinkUIZhCN from '@univerjs/sheets-hyper-link-ui/locale/zh-CN';
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US';
import DrawingUIRuRU from '@univerjs/drawing-ui/locale/ru-RU';
import DrawingUIZhCN from '@univerjs/drawing-ui/locale/zh-CN';
import SheetsDrawingUIEnUS from '@univerjs/sheets-drawing-ui/locale/en-US';
import SheetsDrawingUIRuRU from '@univerjs/sheets-drawing-ui/locale/ru-RU';
import SheetsDrawingUIZhCN from '@univerjs/sheets-drawing-ui/locale/zh-CN';
import DocsDrawingUIEnUS from '@univerjs/docs-drawing-ui/locale/en-US';
import DocsDrawingUIRuRU from '@univerjs/docs-drawing-ui/locale/ru-RU';
import DocsDrawingUIZhCN from '@univerjs/docs-drawing-ui/locale/zh-CN';

export const zhCN = Tools.deepMerge(
    SheetsZhCN,
    DocsUIZhCN,
    FindReplaceZhCN,
    SheetsFindReplaceZhCN,
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
    UniscriptZhCN,
    SheetsHyperLinkUIZhCN,
    DrawingUIZhCN,
    SheetsDrawingUIZhCN,
    DocsDrawingUIZhCN
);

export const enUS = Tools.deepMerge(
    SheetsEnUS,
    DocsUIEnUS,
    FindReplaceEnUS,
    SheetsFindReplaceEnUS,
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
    UniscriptEnUS,
    SheetsHyperLinkUIEnUS,
    DrawingUIEnUS,
    SheetsDrawingUIEnUS,
    DocsDrawingUIEnUS
);

export const ruRU = Tools.deepMerge(
    SheetsRuRU,
    DocsUIRuRU,
    FindReplaceRuRU,
    SheetsFindReplaceRuRU,
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
    UniscriptRuRU,
    SheetsHyperLinkUIRuRU,
    DrawingUIRuRU,
    SheetsDrawingUIRuRU,
    DocsDrawingUIRuRU
);
