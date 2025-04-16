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

import type { Workbook } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';
import { map, merge, of, startWith } from 'rxjs';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export function useActiveWorkbook(): Workbook | null {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), undefined, undefined, []);
    return workbook ?? null;
}

export function useActiveWorksheet(workbook?: Workbook | null) {
    const worksheet = useObservable(() => workbook?.activeSheet$ ?? of(null), undefined, undefined, [workbook]);
    return worksheet;
}

export function useWorkbooks(): Workbook[] {
    const univerInstanceService = useDependency(IUniverInstanceService);
    return useObservable(() => {
        return merge([
            univerInstanceService.getTypeOfUnitAdded$(UniverInstanceType.UNIVER_SHEET),
            univerInstanceService.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET),
        ]).pipe(
            map(() => univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)),
            startWith(univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET))
        );
    }, [], undefined, [univerInstanceService]);
}

export function useSheetSkeleton() {
    const renderManagerService = useDependency(IRenderManagerService);
    const workbook = useActiveWorkbook();

    const { sheetSkeletonManagerService } = useMemo(() => {
        if (workbook) {
            const ru = renderManagerService.getRenderById(workbook.getUnitId());
            return {
                sheetSkeletonManagerService: ru?.with(SheetSkeletonManagerService),
            };
        }

        return { sheetSkeletonManagerService: null };
    }, [workbook, renderManagerService]);

    return sheetSkeletonManagerService;
}
