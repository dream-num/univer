/**
 * Copyright 2023 DreamNum Inc.
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

import type { Workbook } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FWorksheet } from './f-worksheet';

export class FWorkbook {
    constructor(
        private readonly _workbook: Workbook,
        @Inject(Injector) private readonly _injector: Injector
    ) {}

    getActiveSheet(): FWorksheet | null {
        const activeSheet = this._workbook.getActiveSheet();
        if (!activeSheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this._workbook, activeSheet);
    }
}
