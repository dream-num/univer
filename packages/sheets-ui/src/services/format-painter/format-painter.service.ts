import type { ICellData, IStyleData } from '@univerjs/core';
import { Disposable, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { IMarkSelectionService } from '../mark-selection/mark-selection.service';

export interface IFormatPainterService {
    status$: Observable<FormatPainterStatus>;
    setStatus(status: FormatPainterStatus): void;
    getStatus(): FormatPainterStatus;
    getSelectionStyles(): ObjectMatrix<IStyleData>;
}

export enum FormatPainterStatus {
    OFF,
    ONCE,
    INFINITE,
}

export const IFormatPainterService = createIdentifier<IFormatPainterService>('univer.format-painter-service');

export class FormatPainterService extends Disposable implements IFormatPainterService {
    readonly status$: Observable<FormatPainterStatus>;
    private _selectionStyles: ObjectMatrix<IStyleData>;
    private _markId: string | null = null;
    private readonly _status$: BehaviorSubject<FormatPainterStatus>;

    constructor(
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IUniverInstanceService private readonly _currentService: IUniverInstanceService,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService
    ) {
        super();

        this._status$ = new BehaviorSubject<FormatPainterStatus>(FormatPainterStatus.OFF);
        this.status$ = this._status$.asObservable();
        this._selectionStyles = new ObjectMatrix<IStyleData>();
    }

    setStatus(status: FormatPainterStatus) {
        if (status !== FormatPainterStatus.OFF) {
            this._getSelectionRangeStyle();
        }
        this._updateRangeMark(status);
        this._status$.next(status);
    }

    getStatus(): FormatPainterStatus {
        return this._status$.getValue();
    }

    private _updateRangeMark(status: FormatPainterStatus) {
        if (this._markId) {
            this._markSelectionService.removeShape(this._markId);
            this._markId = null;
        }
        if (status !== FormatPainterStatus.OFF) {
            const selection = this._selectionManagerService.getLast();
            if (selection) {
                const style = this._selectionManagerService.createCopyPasteSelection();
                this._markId = this._markSelectionService.addShape({ ...selection, style });
            }
        }
    }

    private _getSelectionRangeStyle() {
        const selection = this._selectionManagerService.getLast();
        const range = selection?.range;
        if (!range) return;
        const { startRow, endRow, startColumn, endColumn } = range;
        const workbook = this._currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook?.getActiveSheet();
        const cellData = worksheet.getCellMatrix();
        // const value = cellData.getFragments(startRow, endRow, startColumn, endColumn);

        const styles = workbook.getStyles();
        const stylesMatrix = new ObjectMatrix<IStyleData>();
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellData.getValue(r, c) as ICellData;
                stylesMatrix.setValue(r, c, styles.getStyleByCell(cell) || {});
            }
        }
        this._selectionStyles = stylesMatrix;
    }

    getSelectionStyles() {
        return this._selectionStyles;
    }
}
