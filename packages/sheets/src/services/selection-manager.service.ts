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

import { Disposable, type ISelectionCell, IUniverInstanceService, type Nullable, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { BehaviorSubject, of, share, Subject, switchMap, takeUntil } from 'rxjs';

import type { ISelectionWithStyle } from '../basics/selection';

export interface ISelectionManagerSearchParam {
    unitId: string;
    sheetId: string;
}

export interface ISelectionManagerInsertParam extends ISelectionManagerSearchParam {
    selectionDatas: ISelectionWithStyle[];
}

//{ { [unitId: string]: { [sheetId: string]: ISelectionWithCoord[] } }
export type ISelectionInfo = Map<string, Map<string, ISelectionWithStyle[]>>;

export enum SelectionMoveType {
    MOVE_START,
    MOVING,
    MOVE_END,
}

export class SelectionManagerService extends RxDisposable {
    private _currentWorksheet: Nullable<ISelectionManagerSearchParam> = null;

    readonly selectionMoveStart$;
    readonly selectionMoving$;
    readonly selectionMoveEnd$;

    private _dirty: boolean = true;

    constructor(
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService
    ) {
        super();

        const c$ = this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).pipe(share(), takeUntil(this.dispose$));
        this.selectionMoveStart$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveStart$));
        this.selectionMoving$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoving$));
        this.selectionMoveEnd$ = c$.pipe(switchMap((workbook) => !workbook ? of([]) : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveEnd$));

        this._instanceSrv.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => {
            this._wbSelections.delete(workbook.getUnitId());
        });
    }

    /**
     * Get which Workbook and worksheet the current selection belongs to.
     * @deprecated Bad design.
     */
    getCurrentWorksheet() {
        return this._currentWorksheet;
    }

    /** @deprecated */
    makeDirty(dirty: boolean = true) {
        this._dirty = dirty;
    }

    /** @deprecated */
    refreshSelection() {
    }

    /** @deprecated should be merged to addSelection */
    setCurrentSelection(param: ISelectionManagerSearchParam) {
        if (this._dirty === false) {
            return;
        }

        this._currentWorksheet = param;
    }

    // TODO@wzhudev: rename to get current selections
    getCurrentSelections(): Readonly<Nullable<ISelectionWithStyle[]>> {
        return this._getSelections(this._currentWorksheet);
    }

    getLast(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        // The last selection position must have a primary.
        return this._getLastByParam(this._currentWorksheet) as Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>>;
    }

    /** @deprecated Bad design. */
    add(selectionDatas: ISelectionWithStyle[]) {
        if (!this._currentWorksheet) {
            return;
        }

        this.addSelections(this._currentWorksheet.unitId, this._currentWorksheet.sheetId, selectionDatas);
    }

    addSelections(unitId: string, worksheetId: string, selectionDatas: ISelectionWithStyle[]) {
        this._ensureWorkbookSelection(unitId).addSelection(worksheetId, selectionDatas);
    }

    setSelections(unitId: string, worksheetId: string, selectionDatas: ISelectionWithStyle[], type: SelectionMoveType = SelectionMoveType.MOVE_END) {
        this._ensureWorkbookSelection(unitId).setSelection(worksheetId, selectionDatas, type);
    }

    replace(selectionDatas: ISelectionWithStyle[], type: SelectionMoveType = SelectionMoveType.MOVE_END) {
        if (!this._currentWorksheet) {
            return;
        }

        this.setSelections(this._currentWorksheet.unitId, this._currentWorksheet.sheetId, selectionDatas, type);
    }

    clear(): void {
        if (this._currentWorksheet == null) {
            return;
        }

        this._clearByParam(this._currentWorksheet);
    }

    /**
     * Determine whether multiple current selections overlap
     *
     * @deprecated this should be extracted to an pure function
     */
    isOverlapping(): boolean {
        const selectionDataList = this.getCurrentSelections();
        if (selectionDataList == null) {
            return false;
        }

        return selectionDataList.some(({ range }, index) =>
            selectionDataList.some(({ range: range2 }, index2) => {
                if (index === index2) {
                    return false;
                }
                return (
                    range.startRow <= range2.endRow &&
                    range.endRow >= range2.startRow &&
                    range.startColumn <= range2.endColumn &&
                    range.endColumn >= range2.startColumn
                );
            })
        );
    }

    private _getSelections(param: Nullable<ISelectionManagerSearchParam>) {
        if (!param) {
            return [];
        }

        const { unitId, sheetId } = param;
        return this._ensureWorkbookSelection(unitId).getSelectionOfWorksheet(sheetId);
    }

    private _getLastByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle>> {
        const selectionData = this._getSelections(param);

        return selectionData?.[selectionData.length - 1];
    }

    private _clearByParam(param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelections(param);
        selectionData?.splice(0);
    }

    getWorkbookSelections(unitId: string): WorkbookSelections {
        return this._ensureWorkbookSelection(unitId);
    }

    private _wbSelections = new Map<string, WorkbookSelections>();
    private _ensureWorkbookSelection(unitId: string): WorkbookSelections {
        let wbSelection = this._wbSelections.get(unitId);
        if (!wbSelection) {
            wbSelection = new WorkbookSelections();
            this._wbSelections.set(unitId, wbSelection);
        }

        return wbSelection;
    }
}

/**
 * This class manages selections in a single workbook.
 */
export class WorkbookSelections extends Disposable {
    private readonly _selectionMoveStart$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private readonly _selectionMoving$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoving$ = this._selectionMoving$.asObservable();

    private readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithStyle[]>([]);
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();

    constructor() {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._selectionMoveEnd$.complete();
        this._selectionMoving$.complete();
        this._selectionMoveStart$.complete();
    }

    addSelection(sheetId: string, selectionDatas: ISelectionWithStyle[]) {
        this._ensureSheetSelection(sheetId).push(...selectionDatas);
    }

    setSelection(sheetId: string, selectionDatas: ISelectionWithStyle[], type: SelectionMoveType = SelectionMoveType.MOVE_END) {
        this._ensureSheetSelection(sheetId).splice(0, selectionDatas.length, ...selectionDatas);

        // WTF: why we would not refresh in add but in replace?
        if (type === SelectionMoveType.MOVE_START) {
            this._selectionMoveStart$.next(selectionDatas);
        } else if (type === SelectionMoveType.MOVING) {
            this._selectionMoving$.next(selectionDatas);
        } else {
            this._selectionMoveEnd$.next(selectionDatas);
        }
    }

    getSelectionOfWorksheet(sheetId: string): ISelectionWithStyle[] {
        if (!this._wsSelections.has(sheetId)) {
            return [];
        }

        return this._wsSelections.get(sheetId)!;
    }

    private _wsSelections = new Map<string, ISelectionWithStyle[]>();
    private _ensureSheetSelection(sheetId: string): ISelectionWithStyle[] {
        let wsSelection = this._wsSelections.get(sheetId);
        if (!wsSelection) {
            wsSelection = [];
            this._wsSelections.set(sheetId, wsSelection);
        }

        return wsSelection;
    }
}
