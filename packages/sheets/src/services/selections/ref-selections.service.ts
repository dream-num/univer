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
import type { Observable } from 'rxjs';
import type { WorkbookSelectionModel } from './selection-data-model';
import { createIdentifier, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { BehaviorSubject, map, merge, switchMap, takeUntil } from 'rxjs';
import { SheetsSelectionsService } from './selection.service';

/**
 * Ref selections service reuses code of `SelectionManagerService`. And it only contains ref selections
 * when user is editing formula.
 *
 * Its data should be cleared by the caller quit editing formula and reconstructed when user starts editing.
 */
export const IRefSelectionsService = createIdentifier<SheetsSelectionsService>('sheets-formula.ref-selections.service');

/**
 * RefSelectionsService treats `selectionMoveStart$` `selectionMoving$` and `selectionMoveEnd$` differently
 * than `SheetsSelectionsService`. Because ref selections can be in different workbooks.
 */
export class RefSelectionsService extends SheetsSelectionsService {
    constructor(
        @IUniverInstanceService _instanceSrv: IUniverInstanceService
    ) {
        super(_instanceSrv);
    }

    protected override _init(): void {
        const $ = this._getAliveWorkbooks$().pipe(takeUntil(this.dispose$));
        this.selectionMoveStart$ = $.pipe(switchMap((ss) => merge(...ss.map((s) => s.selectionMoveStart$))));
        this.selectionMoving$ = $.pipe(switchMap((ss) => merge(...ss.map((s) => s.selectionMoving$))));
        this.selectionMoveEnd$ = $.pipe(switchMap((ss) => merge(...ss.map((s) => s.selectionMoveEnd$))));
        this.selectionSet$ = $.pipe(switchMap((ss) => merge(...ss.map((s) => s.selectionSet$))));
    }

    private _getAliveWorkbooks$(): Observable<WorkbookSelectionModel[]> {
        const aliveWorkbooks = this._instanceSrv.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        aliveWorkbooks.forEach((workbook) => this._ensureWorkbookSelection(workbook.getUnitId()));

        const workbooks$ = new BehaviorSubject(aliveWorkbooks);
        this.disposeWithMe(this._instanceSrv.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            this._ensureWorkbookSelection(workbook.getUnitId());
            workbooks$.next([...workbooks$.getValue(), workbook]);
        }));
        this.disposeWithMe(this._instanceSrv.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            this._removeWorkbookSelection(workbook.getUnitId());
            workbooks$.next(workbooks$.getValue().filter((unit) => unit !== workbook));
        }));

        return workbooks$.pipe(map((workbooks) => workbooks.map((w) => this._ensureWorkbookSelection(w.getUnitId()))));
    }
}
