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

import type { ISelectionWithStyle } from '../../basics/selection';

export interface ISelectionManagerSearchParam {
    unitId: string;
    sheetId: string;
}

export enum SelectionMoveType {
    MOVE_START,
    MOVING,
    MOVE_END,
}

export class SheetsSelectionsService extends RxDisposable {
    private get _currentSelectionPos(): Nullable<ISelectionManagerSearchParam> {
        const workbook = this._instanceSrv.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return null;

        const worksheet = workbook.getActiveSheet();
        return { unitId: workbook.getUnitId(), sheetId: worksheet.getSheetId() };
    }

    selectionMoveStart$: Observable<Nullable<ISelectionWithStyle[]>>;
    selectionMoving$: Observable<Nullable<ISelectionWithStyle[]>>;
    selectionMoveEnd$: Observable<ISelectionWithStyle[]>;

    constructor(
        @IUniverInstanceService protected readonly _instanceSrv: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    protected _init(): void {
        const c$ = this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).pipe(shareReplay(1), takeUntil(this.dispose$));

        this.selectionMoveStart$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveStart$));
        this.selectionMoving$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoving$));
        this.selectionMoveEnd$ = c$.pipe(switchMap((workbook) => !workbook ? of([]) : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveEnd$));

        this._instanceSrv.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => {
            this._removeWorkbookSelection(workbook.getUnitId());
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
            throw new Error('[SheetsSelectionsService]: cannot find current selection position!');
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
            throw new Error('[SheetsSelectionsService]: cannot find current selection position!');
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

    protected _getCurrentSelections() {
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

    protected _workbookSelections = new Map<string, WorkbookSelections>();
    protected _ensureWorkbookSelection(unitId: string): WorkbookSelections {
        let wbSelection = this._workbookSelections.get(unitId);
        if (!wbSelection) {
            const workbook = this._instanceSrv.getUnit<Workbook>(unitId);
            if (!workbook) {
                throw new Error(`[SheetsSelectionsService]: cannot resolve unit with id "${unitId}"!`);
            }

            wbSelection = new WorkbookSelections(workbook);
            this._workbookSelections.set(unitId, wbSelection);
        }

        return wbSelection;
    }

    protected _removeWorkbookSelection(unitId: string): void {
        this._workbookSelections.delete(unitId);
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

    private readonly _beforeSelectionMoveEnd$ = new BehaviorSubject<ISelectionWithStyle[]>([]);
    readonly beforeSelectionMoveEnd$ = this._beforeSelectionMoveEnd$.asObservable();

    constructor(
        private readonly _workbook: Workbook
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._beforeSelectionMoveEnd$.complete();
        this._selectionMoveEnd$.complete();
        this._selectionMoving$.complete();
        this._selectionMoveStart$.complete();
    }

    /** Clear all selections in this workbook. */
    clear(): void {
        this._worksheetSelections.clear();
        this._emitOnEnd([]);
    }

    addSelections(sheetId: string, selectionDatas: ISelectionWithStyle[]) {
        const selections = this._ensureSheetSelection(sheetId);
        selections.push(...selectionDatas);
        this._emitOnEnd(selections);
    }

    /**
     *
     * @param sheetId
     * @param selectionDatas
     * @param type
     */
    setSelections(sheetId: string, selectionDatas: ISelectionWithStyle[], type: SelectionMoveType = SelectionMoveType.MOVE_END) {
        // @TODO lumixraku: selectionDatas should not be same variable !!!
        // but there are some place get selection from this._worksheetSelections and set as 2nd parameter of this function cause problem!!
        this._ensureSheetSelection(sheetId).length = 0;
        this._ensureSheetSelection(sheetId).push(...selectionDatas);

        // WTF: why we would not refresh in add but in replace?
        if (type === SelectionMoveType.MOVE_START) {
            this._selectionMoveStart$.next(selectionDatas);
        } else if (type === SelectionMoveType.MOVING) {
            this._selectionMoving$.next(selectionDatas);
        } else {
            this._emitOnEnd(selectionDatas);
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

    /**
     * same as _getCurrentSelections, but would set [] if no selection.
     * @param sheetId
     * @returns this._worksheetSelections
     */
    private _ensureSheetSelection(sheetId: string): ISelectionWithStyle[] {
        let worksheetSelection = this._worksheetSelections.get(sheetId);
        if (!worksheetSelection) {
            worksheetSelection = [];
            this._worksheetSelections.set(sheetId, worksheetSelection);
        }

        return worksheetSelection;
    }

    private _emitOnEnd(selections: ISelectionWithStyle[]): void {
        this._beforeSelectionMoveEnd$.next(selections);
        this._selectionMoveEnd$.next(selections);
    }
}

/** An context key to disable normal selections if its value is set to `true`. */
export const DISABLE_NORMAL_SELECTIONS = 'DISABLE_NORMAL_SELECTIONS';
