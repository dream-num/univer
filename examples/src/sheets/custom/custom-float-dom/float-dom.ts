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

import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { CustomRangeLoading } from './component';

export function insertFloatDom(univer: Univer, univerAPI: FUniver) {
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
        if (stage === univerAPI.Enum.LifecycleStages.Steady) {
            univerAPI.registerComponent('CustomRangeLoading', CustomRangeLoading);

            const fWorkbook = univerAPI.getActiveWorkbook()!;
            const fWorksheet = fWorkbook.getActiveSheet();
            const fRange = fWorksheet.getRange('A1:C3');
            const disposable = fWorksheet.addFloatDomToRange(fRange, { componentKey: 'CustomRangeLoading' }, {}, 'myRangeLoading');
            console.warn('Float DOM', disposable);
            // remove float dom
            // if (disposable) {
            //     disposable.dispose();
            //     //or
            //     fWorksheet.removeFloatDom(disposable.id);
            // }
        }
    });
}
