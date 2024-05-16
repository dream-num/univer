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

import { LocaleType, Tools } from '@univerjs/core';
import { enUS as UniverDesignEnUS, ruRU as UniverDesignRuRU } from '@univerjs/design';
import { enUS as UniverDocsUIEnUS, ruRU as UniverDocsUIRuRU } from '@univerjs/docs-ui';
import { enUS as UniverSheetsEnUS, ruRU as UniverSheetsRuRU } from '@univerjs/sheets';
import { enUS as UniverSheetsUIEnUS, ruRU as UniverSheetsUIRuRU } from '@univerjs/sheets-ui';
import { enUS as UniverFindReplaceEnUS, ruRU as UniverFindReplaceRuRU } from '@univerjs/find-replace';
import { enUS as UniverSheetsFormulaEnUS, ruRU as UniverSheetsFormulaRuRU } from '@univerjs/sheets-formula';
import { enUS as UniverSheetsDataValidationEnUS, ruRU as UniverSheetsDataValidationRuRU } from '@univerjs/sheets-data-validation';
import { enUS as UniverSheetsConditionalFormattingUIEnUS, ruRU as UniverSheetsConditionalFormattingUIRuRU } from '@univerjs/sheets-conditional-formatting-ui';
import { enUS as UniverSheetsZenEditorEnUS, ruRU as UniverSheetsZenEditorRuRU } from '@univerjs/sheets-zen-editor';
import { enUS as UniverUIEnUS, ruRU as UniverUIRuRU } from '@univerjs/ui';
import { enUS as UniverSheetsFilterUIEnUS, ruRU as UniverSheetsFilterUIRuRU } from '@univerjs/sheets-filter-ui';


export const locales = {
    [LocaleType.EN_US]: Tools.deepMerge(
        UniverSheetsEnUS,
        UniverDocsUIEnUS,
        UniverFindReplaceEnUS,
        UniverSheetsUIEnUS,
        UniverSheetsFormulaEnUS,
        UniverSheetsDataValidationEnUS,
        UniverSheetsConditionalFormattingUIEnUS,
        UniverSheetsZenEditorEnUS,
        UniverUIEnUS,
        UniverDesignEnUS,
        UniverSheetsFilterUIEnUS
    ),
    [LocaleType.RU_RU]: Tools.deepMerge(
        UniverSheetsRuRU,
        UniverDocsUIRuRU,
        UniverFindReplaceRuRU,
        UniverSheetsUIRuRU,
        UniverSheetsFormulaRuRU,
        UniverSheetsDataValidationRuRU,
        UniverSheetsConditionalFormattingUIRuRU,
        UniverSheetsZenEditorRuRU,
        UniverUIRuRU,
        UniverDesignRuRU,
        UniverSheetsFilterUIRuRU
    ),
};
