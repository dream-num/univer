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

import type { IUnitRangeName, Nullable, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { DisposableCollection, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { useDependency, useEvent } from '@univerjs/ui';
import { useEffect } from 'react';

interface IRangeSelectorSelectionChangeProps {
    supportAcrossSheet?: boolean;
    keepSheetReference?: boolean;
    unitId: string;
    subUnitId: string;
    onChange: (ranges: IUnitRangeName[], isStart: boolean) => void;
}

export function useRangeSelectorSelectionChange(opts: IRangeSelectorSelectionChangeProps) {
    const sheetsSelectionsService = useDependency(SheetsSelectionsService);
    const { supportAcrossSheet = false, keepSheetReference = false, unitId, subUnitId, onChange: _onChange } = opts;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    const onChange = useEvent(_onChange);

    const handleSelectionChange = useEvent((selections: Nullable<ISelectionWithStyle[]>, isStart: boolean) => {
        const currentSheet = workbook?.getActiveSheet();
        if (!currentSheet) return;
        if (!supportAcrossSheet && currentSheet.getSheetId() !== subUnitId) return;
        if (!selections?.length) return;
        const sheetName = keepSheetReference ? currentSheet.getName() : (currentSheet.getSheetId() === subUnitId ? '' : currentSheet.getName());
        const ranges = selections.map((item) => ({
            range: item.range,
            unitId,
            sheetName,
        }));

        onChange(ranges, isStart);
    });

    useEffect(() => {
        const disposableCollection = new DisposableCollection();
        disposableCollection.add(sheetsSelectionsService.selectionMoveStart$.subscribe((selections) => {
            handleSelectionChange(selections, true);
        }));

        disposableCollection.add(sheetsSelectionsService.selectionMoving$.subscribe((selections) => {
            handleSelectionChange(selections, false);
        }));

        disposableCollection.add(sheetsSelectionsService.selectionMoveEnd$.subscribe((selections) => {
            handleSelectionChange(selections, false);
        }));

        return () => {
            disposableCollection.dispose();
        };
    }, [handleSelectionChange, sheetsSelectionsService.selectionMoveEnd$, sheetsSelectionsService.selectionMoveStart$, sheetsSelectionsService.selectionMoving$]);
}
