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

import type { ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { ISelectionWithStyle } from '../../basics/selection';

import { Disposable } from '@univerjs/core';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { SelectionMoveType } from './type';

/**
 * Origin name: WorkbookSelections
 * NOT Same as @univerjs/sheets-ui.SelectionRenderModel, that's data for SelectionControl in rendering.
 */
export class WorkbookSelectionModel extends Disposable {
    /**
     * Selection data model for each worksheet.
     */
    private _worksheetSelections = new Map<string, ISelectionWithStyle[]>();

    private readonly _selectionMoveStart$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private readonly _selectionMoving$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoving$ = this._selectionMoving$.asObservable();

    readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithStyle[]>([]);
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();

    private readonly _selectionSet$ = new BehaviorSubject<ISelectionWithStyle[]>([]);
    readonly selectionSet$ = this._selectionSet$.asObservable();

    selectionChanged$: Observable<ISelectionWithStyle[]>;

    private readonly _beforeSelectionMoveEnd$ = new BehaviorSubject<ISelectionWithStyle[]>([]);
    readonly beforeSelectionMoveEnd$ = this._beforeSelectionMoveEnd$.asObservable();

    constructor(
        private readonly _workbook: Workbook
    ) {
        super();
        this.selectionChanged$ = merge(this._selectionMoveEnd$, this._selectionSet$);
    }

    override dispose(): void {
        super.dispose();

        this._beforeSelectionMoveEnd$.complete();
        this._selectionMoveEnd$.complete();
        this._selectionMoving$.complete();
        this._selectionMoveStart$.complete();
        this._selectionSet$.complete();
    }

    addSelections(sheetId: string, selectionDatas: ISelectionWithStyle[]): void {
        const selections = this.getSelectionsOfWorksheet(sheetId);
        selections.push(...selectionDatas);
        this._selectionSet$.next(selections);
    }

    /**
     * Set selectionDatas to _worksheetSelections, and emit selectionDatas by type.
     * @param sheetId
     * @param selectionDatas
     * @param type
     */
    setSelections(sheetId: string, selectionDatas: ISelectionWithStyle[] = [], type: SelectionMoveType): void {
        // selectionDatas should not be same variable as this._worksheetSelections !!!
        // but there are some place get selection from this._worksheetSelections and set selectionDatas(2nd parameter of this function ) cause selectionDatas is always []
        // see univer/pull/2909
        // this.deleteSheetSelection(sheetId);
        this.setSelectionsOfWorksheet(sheetId, selectionDatas);

        switch (type) {
            case SelectionMoveType.MOVE_START:
                this._selectionMoveStart$.next(selectionDatas);
                break;
            case SelectionMoveType.MOVING:
                this._selectionMoving$.next(selectionDatas);
                break;
            case SelectionMoveType.MOVE_END:
                this._beforeSelectionMoveEnd$.next(selectionDatas);
                this._selectionMoveEnd$.next(selectionDatas);
                break;
            case SelectionMoveType.ONLY_SET: {
                this._selectionSet$.next(selectionDatas);
                break;
            }
            default:
                this._selectionSet$.next(selectionDatas);
                break;
        }
    }

    getCurrentSelections(): Readonly<ISelectionWithStyle[]> {
        return this._getCurrentSelections();
    }

    /**
     * @deprecated use `getSelectionsOfWorksheet` instead.
     * @param sheetId
     * @returns
     */
    getSelectionOfWorksheet(sheetId: string): ISelectionWithStyle[] {
        return this.getSelectionsOfWorksheet(sheetId);
    }

    getSelectionsOfWorksheet(sheetId: string): ISelectionWithStyle[] {
        if (!this._worksheetSelections.has(sheetId)) {
            this._worksheetSelections.set(sheetId, []);
        }

        return this._worksheetSelections.get(sheetId)!;
    }

    setSelectionsOfWorksheet(sheetId: string, selections: ISelectionWithStyle[]): void {
        this._worksheetSelections.set(sheetId, [...selections]);
    }

    deleteSheetSelection(sheetId: string) {
        this._worksheetSelections.set(sheetId, []);
    }

    /** Clear all selections in this workbook. */
    clear(): void {
        this._worksheetSelections.clear();
        this._selectionSet$.next([]);
    }

    private _getCurrentSelections(): ISelectionWithStyle[] {
        return this.getSelectionsOfWorksheet(this._workbook.getActiveSheet()!.getSheetId());
    }

    getCurrentLastSelection(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        const selectionData = this._getCurrentSelections();
        return selectionData[selectionData.length - 1] as Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>>;
    }
}
