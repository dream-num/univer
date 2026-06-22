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

import { DEFAULT_DOCUMENT_DATA_SIMPLE } from '@univerjs/mockdata';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN';
import { UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing';
import UniverPresetDocsDrawingZhCN from '@univerjs/preset-docs-drawing/locales/zh-CN';
import { UniverDocsHyperLinkPreset } from '@univerjs/preset-docs-hyper-link';
import UniverPresetDocsHyperLinkZhCN from '@univerjs/preset-docs-hyper-link/locales/zh-CN';
import { UniverDocsThreadCommentPreset } from '@univerjs/preset-docs-thread-comment';
import UniverPresetDocsThreadCommentZhCN from '@univerjs/preset-docs-thread-comment/locales/zh-CN';
import { createUniver, defaultTheme, LocaleType, LogLevel, mergeLocales, UniverInstanceType } from '@univerjs/presets';
import '../global.css';

const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: mergeLocales(
            UniverPresetDocsCoreZhCN,
            UniverPresetDocsDrawingZhCN,
            UniverPresetDocsHyperLinkZhCN,
            UniverPresetDocsThreadCommentZhCN
        ),
    },
    theme: defaultTheme,
    logLevel: LogLevel.VERBOSE,
    presets: [
        UniverDocsCorePreset({
            container: 'app',
        }),
        UniverDocsDrawingPreset(),
        UniverDocsHyperLinkPreset(),
        UniverDocsThreadCommentPreset(),
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
