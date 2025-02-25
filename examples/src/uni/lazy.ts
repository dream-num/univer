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

import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';
import { UniverDocUniFormulaUIPlugin } from '@univerjs/uni-formula-ui';
import type { Plugin, PluginCtor } from '@univerjs/core';
// import { UniverUniscriptPlugin } from '@univerjs/uniscript';

export default function getLazyPlugins(): Array<[PluginCtor<Plugin>] | [PluginCtor<Plugin>, unknown]> {
    return [
        // [
        //     UniverUniscriptPlugin,
        //     {
        //         getWorkerUrl(moduleID: string, label: string) {
        //             if (label === 'typescript' || label === 'javascript') {
        //                 return './vs/language/typescript/ts.worker.js';
        //             }

        //             return './vs/editor/editor.worker.js';
        //         },
        //     },
        // ],
        [UniverSheetsFilterUIPlugin],
        [UniverDocUniFormulaUIPlugin],
    ];
}
