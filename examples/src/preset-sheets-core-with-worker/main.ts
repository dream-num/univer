/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { FUniver, Univer } from '@univerjs/presets';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting';
import UniverPresetSheetsConditionalFormattingZhCN from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import UniverPresetSheetsDataValidationZhCN from '@univerjs/preset-sheets-data-validation/locales/zh-CN';
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing';
import UniverPresetSheetsDrawingZhCN from '@univerjs/preset-sheets-drawing/locales/zh-CN';
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';
import UniverPresetSheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN';
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace';
import UniverPresetSheetsFindReplaceZhCN from '@univerjs/preset-sheets-find-replace/locales/zh-CN';
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link';
import UniverPresetSheetsHyperLinkZhCN from '@univerjs/preset-sheets-hyper-link/locales/zh-CN';
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note';
import UniverPresetSheetsNoteZhCN from '@univerjs/preset-sheets-note/locales/zh-CN';
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort';
import UniverPresetSheetsSortZhCN from '@univerjs/preset-sheets-sort/locales/zh-CN';
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table';
import UniverPresetSheetsTableZhCN from '@univerjs/preset-sheets-table/locales/zh-CN';
import { UniverSheetsThreadCommentPreset } from '@univerjs/preset-sheets-thread-comment';
import UniverPresetSheetsThreadCommentZhCN from '@univerjs/preset-sheets-thread-comment/locales/zh-CN';
import { createUniver, defaultTheme, LocaleType, mergeLocales } from '@univerjs/presets';
import '../global.css';

const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        zhCN: mergeLocales(
            UniverPresetSheetsCoreZhCN,
            UniverPresetSheetsDrawingZhCN,
            UniverPresetSheetsConditionalFormattingZhCN,
            UniverPresetSheetsDataValidationZhCN,
            UniverPresetSheetsFilterZhCN,
            UniverPresetSheetsFindReplaceZhCN,
            UniverPresetSheetsHyperLinkZhCN,
            UniverPresetSheetsNoteZhCN,
            UniverPresetSheetsSortZhCN,
            UniverPresetSheetsTableZhCN,
            UniverPresetSheetsThreadCommentZhCN
        ),
    },
    theme: defaultTheme,
    presets: [
        UniverSheetsCorePreset({
            workerURL: new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
        }),
        UniverSheetsDrawingPreset(),
        UniverSheetsConditionalFormattingPreset(),
        UniverSheetsFilterPreset(),
        UniverSheetsHyperLinkPreset(),
        UniverSheetsDataValidationPreset(),
        UniverSheetsFindReplacePreset(),
        UniverSheetsNotePreset(),
        UniverSheetsSortPreset(),
        UniverSheetsTablePreset(),
        UniverSheetsThreadCommentPreset(),
    ],
});

univerAPI.createWorkbook(DEFAULT_WORKBOOK_DATA_DEMO);

window.univer = univer;
window.univerAPI = univerAPI;

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
        univerAPI?: FUniver;
    }
}
