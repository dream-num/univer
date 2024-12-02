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

import type { Workbook } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { useMemo } from 'react';

export const useResetSelection = (isNeed: boolean) => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sheetsSelectionsService = useDependency(SheetsSelectionsService);

    const resetSelection = useMemo(() => {
        if (isNeed) {
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const sheet = workbook?.getActiveSheet();
            const selections = [...sheetsSelectionsService.getCurrentSelections()];
            return () => {
                const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                const currentSheet = workbook?.getActiveSheet();
                if (currentSheet && currentSheet === sheet) {
                    sheetsSelectionsService.setSelections(selections);
                }
            };
        }
        return () => { };
    }, [isNeed]);

    return resetSelection;
};
