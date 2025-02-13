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

import type { IAccessor } from '@univerjs/core';
import { DataValidationOperator, DataValidationType, Tools } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';

export function createDefaultNewRule(accessor: IAccessor) {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const currentRanges = selectionManagerService.getCurrentSelections().map((s) => s.range);
    const uid = Tools.generateRandomId(6);
    const rule = {
        uid,
        type: DataValidationType.DECIMAL,
        operator: DataValidationOperator.EQUAL,
        formula1: '100',
        ranges: currentRanges ?? [{ startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 }],
    };

    return rule;
}
