import {
    CommandType,
    ICellData,
    ICellDataMatrix,
    ICellV,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRangeData,
    IUndoRedoService,
    Nullable,
    ObjectMatrix,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../Services/selection-manager.service';
import { ISetRangeFormattedValueMutationParams, SetRangeFormattedValueMutation, SetRangeFormattedValueUndoMutationFactory } from '../Mutations/set-range-formatted-value.mutation';

export interface ICopyValuesToRangeCommandParams {
    destinationRange: IRangeData;
}

export const CopyValuesToRangeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-values-to-range',
    handler: async (accessor: IAccessor, params: ICopyValuesToRangeCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService.getRangeDataList();
        if (!selections?.length) return false;
        const originRange = selections[0];
        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const handleResult = handleCopyRange(accessor, workbookId, worksheetId, originRange, params.destinationRange);
        if (!handleResult) return false;
        const value = handleResult[0];
        const range = handleResult[1];
        const cellValue = new ObjectMatrix<ICellV>();
        value.forEach((row, r) =>
            row.forEach((cell, c) => {
                cell = cell as ICellData;
                cellValue.setValue(r + range.startRow, c + range.startColumn, cell?.v || '');
            })
        );

        const setRangeFormattedValueMutationParams: ISetRangeFormattedValueMutationParams = {
            range: [range],
            worksheetId,
            workbookId,
            value: cellValue.getData(),
        };

        const undoMutationParams: ISetRangeFormattedValueMutationParams = SetRangeFormattedValueUndoMutationFactory(accessor, setRangeFormattedValueMutationParams);
        const result = commandService.executeCommand(SetRangeFormattedValueMutation.id, setRangeFormattedValueMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetRangeFormattedValueMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeFormattedValueMutation.id, setRangeFormattedValueMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};

function handleCopyRange(
    accessor: IAccessor,
    workbookId: string,
    worksheetId: string,
    originRange: IRangeData,
    destinationRange: IRangeData
): Nullable<[ICellDataMatrix, IRangeData]> {
    const worksheet = accessor.get(ICurrentUniverService).getUniverSheetInstance(workbookId)?.getWorkBook().getSheetBySheetId(worksheetId);
    if (!worksheet) return;

    const sheetMatrix = worksheet.getCellMatrix();
    const rangeMatrix = new ObjectMatrix<ICellData>();

    const { startRow, endRow, startColumn, endColumn } = originRange;
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            rangeMatrix.setValue(r, c, sheetMatrix.getValue(r, c) || null);
        }
    }

    const cellData = worksheet.getCellMatrix();
    // eslint-disable-next-line prefer-const
    let { startRow: dStartRow, endRow: dEndRow, startColumn: dStartColumn, endColumn: dEndColumn } = destinationRange;

    const originRows = endRow - startRow + 1;
    const originColumns = endColumn - startColumn + 1;
    const destinationRows = dEndRow - dStartRow + 1;
    const destinationColumns = dEndColumn - dStartColumn + 1;

    let value: ICellDataMatrix = [];
    let range: IRangeData;

    // judge whether N2 is a multiple of N1
    if (destinationRows % originRows === 0 && destinationColumns % originColumns === 0) {
        /**
         * A1,B1  =>  A1,B1,C1,D1
         * A2,B2      A2,B2,C2,D2
         *            A3,B3,C3,D3
         *            A4,B4,C4,D4
         */
        for (let r = 0; r < destinationRows; r++) {
            const row = [];
            for (let c = 0; c < destinationColumns; c++) {
                // Retrieve the corresponding cell data from the original range, {} as a fallback
                const cell = cellData.getValue((r + startRow) % originRows, (c + startColumn) % originColumns) || {};
                row.push(cell);
            }
            value.push(row);
        }
        range = destinationRange;
    } else {
        value = cellData.getFragments(startRow, endRow, startColumn, endColumn).getData() as ICellDataMatrix;

        // Extend the destination to the same size as the original range
        dEndRow += originRows - destinationRows;
        dEndColumn += originColumns - destinationColumns;

        range = {
            startRow: dStartRow,
            endRow: dEndRow,
            startColumn: dStartColumn,
            endColumn: dEndColumn,
        };
    }

    return [value, range];
}
