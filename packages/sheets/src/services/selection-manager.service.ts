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

import type { ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, of, shareReplay, Subject, switchMap, takeUntil } from 'rxjs';

import type { ISelectionWithStyle } from '../basics/selection';

export interface ISelectionManagerSearchParam {
    unitId: string;
    sheetId: string;
}

export enum SelectionMoveType {
    MOVE_START,
    MOVING,
    MOVE_END,
}

export interface ISelectionManager { }

export class SelectionManagerService extends RxDisposable {
    private get _currentSelectionPos(): Nullable<ISelectionManagerSearchParam> {
        const workbook = this._instanceSrv.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return null;

        const worksheet = workbook.getActiveSheet();
        return { unitId: workbook.getUnitId(), sheetId: worksheet.getSheetId() };
    }

    readonly selectionMoveStart$: Observable<Nullable<ISelectionWithStyle[]>>;
    readonly selectionMoving$: Observable<Nullable<ISelectionWithStyle[]>>;
    readonly selectionMoveEnd$: Observable<ISelectionWithStyle[]>;

    constructor(
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService
    ) {
        super();

        const c$ = this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).pipe(shareReplay(1), takeUntil(this.dispose$));
        this.selectionMoveStart$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveStart$));
        this.selectionMoving$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoving$));
        this.selectionMoveEnd$ = c$.pipe(switchMap((workbook) => !workbook ? of([]) : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveEnd$));

        this._instanceSrv.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => {
            this._workbookSelections.delete(workbook.getUnitId());
        });
    }

    /** Clear all selections in all workbooks. */
    clear(): void {
        this._workbookSelections.forEach((wbSelection) => wbSelection.clear());
    }

    getCurrentSelections(): Readonly<ISelectionWithStyle[]> {
        return this._getCurrentSelections();
    }

    getCurrentLastSelection(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        const selectionData = this._getCurrentSelections();
        return selectionData?.[selectionData.length - 1] as Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>>;
    }

    addSelections(selectionsData: ISelectionWithStyle[]): void;
    addSelections(unitId: string, worksheetId: string, selectionDatas: ISelectionWithStyle[]): void;
    addSelections(unitIdOrSelections: string | ISelectionWithStyle[], worksheetId?: string, selectionDatas?: ISelectionWithStyle[]): void {
        if (typeof unitIdOrSelections === 'string') {
            this._ensureWorkbookSelection(unitIdOrSelections).addSelections(worksheetId!, selectionDatas!);
            return;
        }

        const current = this._currentSelectionPos;
        if (!current) {
            throw new Error('[SelectionManagerService]: cannot find current selection position!');
        }

        const { unitId, sheetId } = current;
        this._ensureWorkbookSelection(unitId).addSelections(sheetId, unitIdOrSelections);
    }

    setSelections(selectionDatas: ISelectionWithStyle[], type?: SelectionMoveType): void;
    setSelections(unitId: string, worksheetId: string, selectionDatas: ISelectionWithStyle[], type?: SelectionMoveType): void;
    setSelections(
        unitIdOrSelections: string | ISelectionWithStyle[],
        worksheetIdOrType: string | SelectionMoveType | undefined,
        selectionDatas?: ISelectionWithStyle[],
        type?: SelectionMoveType
    ): void {
        if (typeof unitIdOrSelections === 'string') {
            this._ensureWorkbookSelection(unitIdOrSelections).setSelections(worksheetIdOrType as string, selectionDatas!, type ?? SelectionMoveType.MOVE_END);
            return;
        }

        const current = this._currentSelectionPos;
        if (!current) {
            throw new Error('[SelectionManagerService]: cannot find current selection position!');
        }

        const { unitId, sheetId } = current;
        this._ensureWorkbookSelection(unitId).setSelections(sheetId, unitIdOrSelections, worksheetIdOrType as SelectionMoveType ?? SelectionMoveType.MOVE_END);
    }

    clearCurrentSelections(): void {
        const selectionData = this._getCurrentSelections();
        selectionData.splice(0);
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

    private _getCurrentSelections() {
        const current = this._currentSelectionPos;
        if (!current) {
            return [];
        }

        const { unitId, sheetId } = current;
        return this._ensureWorkbookSelection(unitId).getSelectionOfWorksheet(sheetId);
    }

    getWorkbookSelections(unitId: string): WorkbookSelections {
        return this._ensureWorkbookSelection(unitId);
    }

    private _workbookSelections = new Map<string, WorkbookSelections>();
    private _ensureWorkbookSelection(unitId: string): WorkbookSelections {
        let wbSelection = this._workbookSelections.get(unitId);
        if (!wbSelection) {
            const workbook = this._instanceSrv.getUnit<Workbook>(unitId);
            if (!workbook) {
                throw new Error(`[SelectionManagerService]: cannot resolve unit with id "${unitId}"!`);
            }

            wbSelection = new WorkbookSelections(workbook);
            this._workbookSelections.set(unitId, wbSelection);
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

    constructor(
        private readonly _workbook: Workbook
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._selectionMoveEnd$.complete();
        this._selectionMoving$.complete();
        this._selectionMoveStart$.complete();
    }

    /** Clear all selections in this workbook. */
    clear(): void {
        this._worksheetSelections.clear();
        this._selectionMoveEnd$.next([]);
    }

    addSelections(sheetId: string, selectionDatas: ISelectionWithStyle[]) {
        const selections = this._ensureSheetSelection(sheetId);
        selections.push(...selectionDatas);
        this._selectionMoveEnd$.next(selections);
    }

    setSelections(sheetId: string, selectionDatas: ISelectionWithStyle[], type: SelectionMoveType = SelectionMoveType.MOVE_END) {
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

    getCurrentSelections(): Readonly<ISelectionWithStyle[]> {
        return this._getCurrentSelections();
    }

    getSelectionOfWorksheet(sheetId: string): ISelectionWithStyle[] {
        if (!this._worksheetSelections.has(sheetId)) {
            return [];
        }

        return this._worksheetSelections.get(sheetId)!;
    }

    private _getCurrentSelections() {
        return this.getSelectionOfWorksheet(this._workbook.getActiveSheet()!.getSheetId());
    }

    getCurrentLastSelection(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        const selectionData = this._getCurrentSelections();
        return selectionData[selectionData.length - 1] as Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>>;
    }

    private _worksheetSelections = new Map<string, ISelectionWithStyle[]>();
    private _ensureSheetSelection(sheetId: string): ISelectionWithStyle[] {
        let worksheetSelection = this._worksheetSelections.get(sheetId);
        if (!worksheetSelection) {
            worksheetSelection = [];
            this._worksheetSelections.set(sheetId, worksheetSelection);
        }

        return worksheetSelection;
    }
}
