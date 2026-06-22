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

import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { UniverSheetsCoreWorkerPreset } from '@univerjs/preset-sheets-core/worker';

import UniverPresetSheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN';
import { UniverSheetsFilterWorkerPreset } from '@univerjs/preset-sheets-filter/worker';

import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';

createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        zhCN: mergeLocales(
            UniverPresetSheetsCoreZhCN,
            UniverPresetSheetsFilterZhCN
        ),
    },
    presets: [
        UniverSheetsCoreWorkerPreset(),
        UniverSheetsFilterWorkerPreset(),
    ],
});
