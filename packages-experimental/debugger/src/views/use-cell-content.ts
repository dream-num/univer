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

import { ILogService, IUniverInstanceService, ObjectMatrix, Range } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';

export function useCellContent() {
    const logService = useDependency(ILogService);
    const selectionManagerService = useDependency(SheetsSelectionsService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const onSelect = () => {
        const selections = selectionManagerService.getCurrentSelections();
        const target = getSheetCommandTarget(univerInstanceService);
        const matrix = new ObjectMatrix();
        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                matrix.setValue(row, col, target?.worksheet.getCell(row, col));
            });
        });
        logService.debug('cell-content', matrix);
    };

    return {
        type: 'item' as const,
        children: '🗒️ Console cell content',
        onSelect,
    };
}
