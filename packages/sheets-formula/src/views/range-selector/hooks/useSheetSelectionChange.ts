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

import { IUniverInstanceService, useDependency } from '@univerjs/core';

import { SheetsSelectionsService } from '@univerjs/sheets';
import { useEffect } from 'react';
import { getSheetNameById, unitRangesToText } from '../utils/unitRangesToText';

export const useSheetSelectionChange = (isNeed: boolean, unitId: string, subUnitId: string, handleRangeChange: (refString: string) => void) => {
    const workbookSelections = useDependency(SheetsSelectionsService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    useEffect(() => {
        if (isNeed) {
            let isFirst = true;
            const dispose = workbookSelections.selectionMoveEnd$.subscribe((selections) => {
                const params = workbookSelections.currentSelectionParam;
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                if (!params) {
                    return;
                }
                const { unitId: rangeUnitId, sheetId: rangeSubUnitId } = params;
                const range = selections[selections.length - 1].range;
                const result = unitRangesToText([{
                    range,
                    unitId: rangeUnitId,
                    sheetName: getSheetNameById(univerInstanceService, rangeUnitId, rangeSubUnitId),
                }],
                unitId, subUnitId, univerInstanceService)
                    .join(',');
                handleRangeChange(result);
            });
            return () => {
                dispose.unsubscribe();
            };
        }
    }, [isNeed, handleRangeChange]);
};
