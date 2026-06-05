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

import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { createUniver, LocaleType, LogLevel, mergeLocales } from '@univerjs/presets';

import '@univerjs/preset-sheets-core/lib/index.css';
import '../global.css';

const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: mergeLocales(UniverPresetSheetsCoreZhCN),
    },
    logLevel: LogLevel.VERBOSE,
    presets: [
        UniverSheetsCorePreset({
            container: 'app',
            workerURL: new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
        }),
    ],
});

univerAPI.createWorkbook(DEFAULT_WORKBOOK_DATA_DEMO);

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: typeof univer;
        univerAPI?: typeof univerAPI;
    }
}

window.univer = univer;
window.univerAPI = univerAPI;
