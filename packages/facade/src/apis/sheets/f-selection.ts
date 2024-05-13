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

import type { Workbook, Worksheet } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { FRange } from './f-range';

export class FSelection {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _selections: Readonly<ISelectionWithStyle[]>,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        // empty
    }

    getActiveRange(): FRange | null {
        const active = this._selections.find((selection) => !!selection.primary);
        if (!active) {
            return null;
        }

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, active.range);
    }
}
