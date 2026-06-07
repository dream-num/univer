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

import { UniverInstanceType } from '@univerjs/core';
import { DEFAULT_DOCUMENT_DATA_SIMPLE } from '@univerjs/mockdata';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN';
import { createUniver, LocaleType, LogLevel, mergeLocales } from '@univerjs/presets';

import '../global.css';

const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: mergeLocales(UniverPresetDocsCoreZhCN),
    },
    logLevel: LogLevel.VERBOSE,
    presets: [
        UniverDocsCorePreset({
            container: 'app',
        }),
    ],
});

univer.createUnit(UniverInstanceType.UNIVER_DOC, DEFAULT_DOCUMENT_DATA_SIMPLE);

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: typeof univer;
        univerAPI?: typeof univerAPI;
    }
}

window.univer = univer;
window.univerAPI = univerAPI;
