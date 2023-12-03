import { SelectionManagerService } from '@univerjs/sheets';
import { Disposable, ICellData, IStyleData, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { createIdentifier, Inject } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

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

    private readonly _status$: BehaviorSubject<FormatPainterStatus>;

    constructor(
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IUniverInstanceService private readonly _currentService: IUniverInstanceService
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
        this._status$.next(status);
    }

    getStatus(): FormatPainterStatus {
        return this._status$.getValue();
    }

    private _getSelectionRangeStyle() {
        const selection = this._selectionManagerService.getLast();
        const range = selection?.range;
        if (!range) return;
        const { startRow, endRow, startColumn, endColumn } = range;
        const workbook = this._currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook?.getActiveSheet();
        const cellData = worksheet.getCellMatrix();
        const value = cellData.getFragments(startRow, endRow, startColumn, endColumn);

        const styles = workbook.getStyles();
        const stylesMatrix = new ObjectMatrix<IStyleData>();
        value.forValue((r, c, cell) => {
            cell = cell as ICellData;
            stylesMatrix.setValue(r, c, styles.getStyleByCell(cell) || {});
        });
        this._selectionStyles = stylesMatrix;
    }

    getSelectionStyles() {
        return this._selectionStyles;
    }
}
