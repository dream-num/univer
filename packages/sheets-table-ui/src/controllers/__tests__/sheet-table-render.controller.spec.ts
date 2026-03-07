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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsTableRenderController } from '../sheet-table-render.controller';

describe('SheetsTableRenderController', () => {
    it('should dirty skeleton and recalculate on table/theme refresh events', () => {
        const tableAdd$ = new Subject<any>();
        const tableDelete$ = new Subject<any>();
        const tableNameChanged$ = new Subject<any>();
        const tableRangeChanged$ = new Subject<any>();
        const tableThemeChanged$ = new Subject<any>();
        const tableFilterChanged$ = new Subject<any>();
        const tableInitStatus$ = new Subject<any>();
        const refreshTable$ = new Subject<number>();

        const makeDirty = vi.fn();
        const reCalculate = vi.fn();

        const controller = new SheetsTableRenderController(
            {
                mainComponent: { makeDirty },
            } as any,
            {} as any,
            {
                getCurrentParam: () => ({ unitId: 'u1', subUnitId: 's1' }),
                reCalculate,
            } as any,
            {
                tableAdd$,
                tableDelete$,
                tableNameChanged$,
                tableRangeChanged$,
                tableThemeChanged$,
                tableFilterChanged$,
                tableInitStatus$,
            } as any,
            {
                refreshTable$,
            } as any
        );

        tableAdd$.next({});
        tableDelete$.next({});
        tableNameChanged$.next({});
        tableRangeChanged$.next({});
        tableThemeChanged$.next({});
        tableFilterChanged$.next({});
        tableInitStatus$.next(true);
        refreshTable$.next(1);

        expect(makeDirty).toHaveBeenCalled();
        expect(reCalculate).toHaveBeenCalledWith({ unitId: 'u1', subUnitId: 's1', dirty: true });

        controller.dispose();
    });
});
