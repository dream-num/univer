import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/base-render';
import {
    ISetRangeValuesCommandParams,
    ISetSelectionsOperationParams,
    SelectionManagerService,
    SetRangeValuesCommand,
    SetSelectionsOperation,
} from '@univerjs/base-sheets';
import {
    Disposable,
    ICellData,
    ICommandInfo,
    ICommandService,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetOnceFormatPainterCommand } from '../../commands/commands/set-format-painter.command';
import { FORMAT_PAINTER_SELECTION_PLUGIN_NAME } from '../../commands/operations/selection.operation';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';

@OnLifecycle(LifecycleStages.Rendered, FormatPainterController)
export class FormatPainterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFormatPainterService private readonly _formatPainterService: IFormatPainterService,
        @IUniverInstanceService private readonly _currentService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
        this._bindFormatPainterStatus();
    }

    private _bindFormatPainterStatus() {
        this._formatPainterService.status$.subscribe((status) => {
            const scene = this._renderManagerService.getCurrent()?.scene;
            if (!scene) return;
            if (status !== FormatPainterStatus.OFF) {
                scene.setDefaultCursor(CURSOR_TYPE.CELL);
            } else {
                scene.setDefaultCursor(CURSOR_TYPE.DEFAULT);
            }
        });
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (
                    command.id === SetSelectionsOperation.id &&
                    (command.params as ISetSelectionsOperationParams)?.pluginName ===
                        FORMAT_PAINTER_SELECTION_PLUGIN_NAME
                ) {
                    const isFormatPainterOn = this._formatPainterService.getStatus() !== FormatPainterStatus.OFF;
                    if (!isFormatPainterOn) return;
                    const { selections } = command.params as ISetSelectionsOperationParams;
                    const { range } = selections[selections.length - 1];
                    this._applyFormatPainter(range);
                }
            })
        );
    }

    private _applyFormatPainter(range: IRange) {
        const stylesMatrix = this._formatPainterService.getSelectionStyles();
        const workbookId = this._currentService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = this._currentService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        if (!stylesMatrix) return;

        const styleRowsNum = stylesMatrix.getLength();
        const styleColsNum = stylesMatrix.getSizeOf();
        const styleValues: ICellData[][] = Array.from({ length: range.endRow - range.startRow + 1 }, () =>
            Array.from({ length: range.endColumn - range.startColumn + 1 }, () => ({}))
        );

        styleValues.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                const mappedRowIndex = rowIndex % styleRowsNum;
                const mappedColIndex = colIndex % styleColsNum;
                const style = stylesMatrix.getValue(mappedRowIndex, mappedColIndex);

                if (style) {
                    styleValues[rowIndex][colIndex].s = style;
                }
            });
        });

        const setRangeValuesCommandParams: ISetRangeValuesCommandParams = {
            worksheetId,
            workbookId,
            range,
            value: styleValues,
        };

        this._commandService.executeCommand(SetRangeValuesCommand.id, setRangeValuesCommandParams);

        // if the format painter is once, turn it off
        if (this._formatPainterService.getStatus() === FormatPainterStatus.ONCE) {
            this._commandService.executeCommand(SetOnceFormatPainterCommand.id);
        }
    }
}
