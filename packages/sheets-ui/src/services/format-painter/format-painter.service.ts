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

import type { ICellData, IRange, IStyleData, Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { getCellInfoInMergeData } from '@univerjs/engine-render';
import { SelectionManagerService, SetRangeValuesMutation } from '@univerjs/sheets';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { IMarkSelectionService } from '../mark-selection/mark-selection.service';

export interface IFormatPainterService {
    status$: Observable<FormatPainterStatus>;
    setStatus(status: FormatPainterStatus): void;
    getStatus(): FormatPainterStatus;
    getSelectionFormat(): ISelectionFormatInfo;
}

export interface ISelectionFormatInfo {
    styles: ObjectMatrix<IStyleData>;
    merges: IRange[];
}
export enum FormatPainterStatus {
    OFF,
    ONCE,
    INFINITE,
}

export const IFormatPainterService = createIdentifier<IFormatPainterService>('univer.format-painter-service');

export class FormatPainterService extends Disposable implements IFormatPainterService {
    readonly status$: Observable<FormatPainterStatus>;
    private _selectionFormat: ISelectionFormatInfo;
    private _markId: string | null = null;
    private readonly _status$: BehaviorSubject<FormatPainterStatus>;

    constructor(
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService
    ) {
        super();

        this._status$ = new BehaviorSubject<FormatPainterStatus>(FormatPainterStatus.OFF);
        this.status$ = this._status$.asObservable();
        this._selectionFormat = { styles: new ObjectMatrix<IStyleData>(), merges: [] };
    }

    setStatus(status: FormatPainterStatus) {
        if (status !== FormatPainterStatus.OFF) {
            this._getSelectionRangeFormat();
        }
        this._updateRangeMark(status);
        this._status$.next(status);
    }

    getStatus(): FormatPainterStatus {
        return this._status$.getValue();
    }

    private _updateRangeMark(status: FormatPainterStatus) {
        this._markSelectionService.removeAllShapes();
        this._markId = null;

        if (status !== FormatPainterStatus.OFF) {
            const selection = this._selectionManagerService.getLast();
            if (selection) {
                const style = this._selectionManagerService.createCopyPasteSelection();
                if (status === FormatPainterStatus.INFINITE) {
                    this._markId = this._markSelectionService.addShape({ ...selection, style });
                } else {
                    this._markId = this._markSelectionService.addShape({ ...selection, style }, [
                        SetRangeValuesMutation.id,
                    ]);
                }
            }
        }
    }

    private _getSelectionRangeFormat() {
        const selection = this._selectionManagerService.getLast();
        const range = selection?.range;
        if (!range) return;
        const { startRow, endRow, startColumn, endColumn } = range;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        const cellData = worksheet.getCellMatrix();
        const mergeData = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getMergeData();

        const styles = workbook.getStyles();
        const stylesMatrix = new ObjectMatrix<IStyleData>();
        this._selectionFormat.merges = [];
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellData.getValue(r, c) as ICellData;
                stylesMatrix.setValue(r, c, styles.getStyleByCell(cell) || {});
                const { isMergedMainCell, ...mergeInfo } = getCellInfoInMergeData(r, c, mergeData);
                if (isMergedMainCell) {
                    this._selectionFormat.merges.push({
                        startRow: mergeInfo.startRow,
                        startColumn: mergeInfo.startColumn,
                        endRow: mergeInfo.endRow,
                        endColumn: mergeInfo.endColumn,
                    });
                }
            }
        }
        this._selectionFormat.styles = stylesMatrix;
    }

    getSelectionFormat() {
        return this._selectionFormat;
    }
}
