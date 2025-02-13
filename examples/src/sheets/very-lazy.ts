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

import type { Plugin, PluginCtor } from '@univerjs/core';
import { UniverActionRecorderPlugin } from '@univerjs/action-recorder';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverUniscriptPlugin } from '@univerjs/uniscript';
import { UniverWatermarkPlugin } from '@univerjs/watermark';

/* eslint-disable-next-line node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

export default function getVeryLazyPlugins() {
    const plugins: Array<[PluginCtor<Plugin>] | [PluginCtor<Plugin>, unknown]> = [

        [UniverActionRecorderPlugin],
        [UniverSheetsHyperLinkUIPlugin],
        [UniverSheetsSortUIPlugin],
        [UniverSheetsCrosshairHighlightPlugin],
        [UniverSheetsFindReplacePlugin],
        [UniverWatermarkPlugin],
    ];

    if (!IS_E2E) {
        plugins.push([UniverDebuggerPlugin]);
        plugins.push([UniverUniscriptPlugin, {
            getWorkerUrl(_: string, label: string) {
                if (label === 'json') {
                    return '/vs/language/json/json.worker.js';
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return '/vs/language/css/css.worker.js';
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return '/vs/language/html/html.worker.js';
                }
                if (label === 'typescript' || label === 'javascript') {
                    return '/vs/language/typescript/ts.worker.js';
                }
                return '/vs/editor/editor.worker.js';
            },
        }]);
    }

    return plugins;
}
