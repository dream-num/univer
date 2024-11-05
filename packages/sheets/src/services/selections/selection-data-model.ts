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
import type { ISelectionWithStyle } from '../../basics/selection';
import { Disposable } from '@univerjs/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { SelectionMoveType } from './type';

/**
 * Origin name: WorkbookSelections
 * NOT Same as @univerjs/sheets-ui.SelectionRenderModel, that's data for SelectionControl in rendering.
 */
export class WorkbookSelectionDataModel extends Disposable {
    private readonly _selectionMoveStart$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private readonly _selectionMoving$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoving$ = this._selectionMoving$.asObservable();

    readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithStyle[]>([]);
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();

    private readonly _selectionSet$ = new BehaviorSubject<ISelectionWithStyle[]>([]);
    readonly selectionSet$ = this._selectionSet$.asObservable();

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

    addSelections(sheetId: string, selectionDatas: ISelectionWithStyle[]): void {
        const selections = this._ensureSheetSelection(sheetId);
        selections.push(...selectionDatas);
        this._emitOnEnd(selections);
    }

    /**
     * Set selectionDatas to _worksheetSelections, and emit selectionDatas by type.
     * If type is not specified, this method would clear all existing selections.
     * @param sheetId
     * @param selectionDatas
     * @param type
     */
    setSelections(sheetId: string, selectionDatas: ISelectionWithStyle[] = [], type: SelectionMoveType): void {
        // selectionDatas should not be same variable as this._worksheetSelections !!!
        // but there are some place get selection from this._worksheetSelections and set selectionDatas(2nd parameter of this function ) cause selectionDatas is always []
        // see univer/pull/2909
        this._ensureSheetSelection(sheetId).length = 0;
        this._ensureSheetSelection(sheetId).push(...selectionDatas);

        switch (type) {
            case SelectionMoveType.MOVE_START:
                this._selectionMoveStart$.next(selectionDatas);
                break;
            case SelectionMoveType.MOVING:
                this._selectionMoving$.next(selectionDatas);
                break;
            case SelectionMoveType.MOVE_END:
                this._emitOnEnd(selectionDatas);
                break;
            case SelectionMoveType.ONLY_SET: {
                this._selectionSet$.next(selectionDatas);
                break;
            }
            default:
                this._emitOnEnd(selectionDatas);
                break;
        }
    }

    getCurrentSelections(): Readonly<ISelectionWithStyle[]> {
        return this._getCurrentSelections();
    }

    getSelectionOfWorksheet(sheetId: string): ISelectionWithStyle[] {
        if (!this._worksheetSelections.has(sheetId)) {
            this._worksheetSelections.set(sheetId, []);
        }

        return this._worksheetSelections.get(sheetId)!;
    }

    private _getCurrentSelections(): ISelectionWithStyle[] {
        return this.getSelectionOfWorksheet(this._workbook.getActiveSheet()!.getSheetId());
    }

    getCurrentLastSelection(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        const selectionData = this._getCurrentSelections();
        return selectionData[selectionData.length - 1] as Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>>;
    }

    private _worksheetSelections = new Map<string, ISelectionWithStyle[]>();

    /**
     * Same as _getCurrentSelections(which return this._worksheetSelections), but this method would set [] if no selection.
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
