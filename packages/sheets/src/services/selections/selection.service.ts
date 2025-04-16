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

import type { DeepReadonly, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { ISelectionWithStyle } from '../../basics/selection';
import type { ISelectionManagerSearchParam } from './type';

import { IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { distinctUntilChanged, of, shareReplay, skip, switchMap, takeUntil } from 'rxjs';
import { WorkbookSelectionModel } from './selection-data-model';
import { SelectionMoveType } from './type';

/**
 * For normal selection.
 * Ref selection is in RefSelectionService which extends this class.
 */
export class SheetsSelectionsService extends RxDisposable {
    private get _currentSelectionPos(): Nullable<ISelectionManagerSearchParam> {
        const workbook = this._instanceSrv.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return null;

        const worksheet = workbook.getActiveSheet();
        return { unitId: workbook.getUnitId(), sheetId: worksheet.getSheetId() };
    }

    get currentSelectionParam() {
        return this._currentSelectionPos;
    }

    /**
     * Selection Events, usually triggered when pointerdown in spreadsheet by selection render service after selectionModel has updated.
     */
    selectionMoveStart$: Observable<Nullable<ISelectionWithStyle[]>>;

    /**
     * Selection Events, usually triggered when pointermove in spreadsheet by selection render service after selectionModel has updated.
     */
    selectionMoving$: Observable<Nullable<ISelectionWithStyle[]>>;

    /**
     * Selection Events, usually triggered when pointerup in spreadsheet by selection render service after selectionModel has updated.
     */
    selectionMoveEnd$: Observable<ISelectionWithStyle[]>;

    /**
     * Selection Events, usually triggered when changing unit.(focus in formula editor)
     */
    selectionSet$: Observable<Nullable<ISelectionWithStyle[]>>;

    /**
     * Selection Events, merge moveEnd$ and selectionSet$
     */
    selectionChanged$: Observable<Nullable<ISelectionWithStyle[]>>;

    constructor(
        @IUniverInstanceService protected readonly _instanceSrv: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    protected _init(): void {
        const c$ = this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).pipe(shareReplay(1), takeUntil(this.dispose$));
        // When workbook changed, unsubscribe the previous workbook selection$ and subscribe the new workbook selection$.
        this.selectionMoveStart$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveStart$));
        this.selectionMoving$ = c$.pipe(switchMap((workbook) => !workbook ? of() : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoving$));
        this.selectionMoveEnd$ = c$.pipe(switchMap((workbook) => !workbook ? of([]) : this._ensureWorkbookSelection(workbook.getUnitId()).selectionMoveEnd$));
        this.selectionSet$ = c$.pipe(switchMap((workbook) => !workbook ? of([]) : this._ensureWorkbookSelection(workbook.getUnitId()).selectionSet$));
        this.selectionChanged$ = c$.pipe(switchMap((workbook) => !workbook ? of([]) : this._ensureWorkbookSelection(workbook.getUnitId()).selectionChanged$)).pipe(
            distinctUntilChanged((prev, curr) => {
                if (prev.length !== curr.length) return false;
                if (prev.length === 0 && curr.length === 0) return true;
                return prev.every((item, index) => {
                    return JSON.stringify(item) === JSON.stringify(curr[index]);
                });
            }),
            skip(1)
        );

        this._instanceSrv.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => {
            this._removeWorkbookSelection(workbook.getUnitId());
        });
    }

    /**
     * Clear all selections in all workbooks.
     * invoked by prompt.controller
     */
    clear(): void {
        this._workbookSelections.forEach((wbSelection) => wbSelection.clear());
    }

    getCurrentSelections(): Readonly<ISelectionWithStyle[]> {
        return this._getCurrentSelections();
    }

    getCurrentLastSelection(): DeepReadonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
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

    /**
     * Set selection data to WorkbookSelectionModel.
     *
     * @param unitIdOrSelections
     * @param worksheetIdOrType
     * @param selectionDatas
     * @param type
     */
    setSelections(selectionDatas: ISelectionWithStyle[], type?: SelectionMoveType): void;
    setSelections(unitId: string, worksheetId: string, selectionDatas: ISelectionWithStyle[], type?: SelectionMoveType): void;
    setSelections(
        unitIdOrSelections: string | ISelectionWithStyle[],
        worksheetIdOrType: string | SelectionMoveType | undefined,
        selectionDatas?: ISelectionWithStyle[],
        type?: SelectionMoveType
    ): void {
        if (typeof unitIdOrSelections === 'string' && typeof worksheetIdOrType === 'string') {
            const unitId = unitIdOrSelections as string;
            this._ensureWorkbookSelection(unitId).setSelections(
                worksheetIdOrType,
                selectionDatas || [],
                type ?? SelectionMoveType.ONLY_SET
            );
            return;
        }

        const current = this._currentSelectionPos;
        if (!current) {
            throw new Error('[SheetsSelectionsService]: cannot find current selection position!');
        }

        const { unitId, sheetId } = current;
        if (typeof unitIdOrSelections === 'object') {
            const selectionData = unitIdOrSelections ?? selectionDatas;
            const type = worksheetIdOrType as SelectionMoveType ?? SelectionMoveType.ONLY_SET;
            this._ensureWorkbookSelection(unitId).setSelections(sheetId, selectionData, type);
        }
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
        return this._ensureWorkbookSelection(unitId).getSelectionsOfWorksheet(sheetId);
    }

    getWorkbookSelections(unitId: string): WorkbookSelectionModel {
        return this._ensureWorkbookSelection(unitId);
    }

    protected _workbookSelections = new Map<string, WorkbookSelectionModel>();
    protected _ensureWorkbookSelection(unitId: string): WorkbookSelectionModel {
        let wbSelection = this._workbookSelections.get(unitId);
        if (!wbSelection) {
            const workbook = this._instanceSrv.getUnit<Workbook>(unitId);
            if (!workbook) {
                throw new Error(`[SheetsSelectionsService]: cannot resolve unit with id "${unitId}"!`);
            }

            wbSelection = new WorkbookSelectionModel(workbook);
            this._workbookSelections.set(unitId, wbSelection);
        }

        return wbSelection;
    }

    protected _removeWorkbookSelection(unitId: string): void {
        this._workbookSelections.delete(unitId);
    }
}

/** An context key to disable normal selections if its value is set to `true`. */
// so Bad! why not enableXXX
export const DISABLE_NORMAL_SELECTIONS = 'DISABLE_NORMAL_SELECTIONS';
export const SELECTIONS_ENABLED = 'SELECTIONS_ENABLED';
export const REF_SELECTIONS_ENABLED = 'REF_SELECTIONS_ENABLED';
export const SELECTION_MODE = '__SELECTION_MODE__';
export enum SelectionMode {
    NORMAL,
    REF,
}
