import {
    CommandType,
    ICellData,
    ICellDataMatrix,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IOptionData,
    IRangeData,
    IUndoRedoService,
    Nullable,
    ObjectMatrix,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../Services/selection-manager.service';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../Mutations/set-range-values.mutation';

export interface ICopyRangeToCommandParams {
    destinationRange: IRangeData;
    options?: IOptionData;
}

export const CopyRangeToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-range-to',
    handler: async (accessor: IAccessor, params: ICopyRangeToCommandParams) => {
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
        const options = params.options ?? {};
        const cellValue = new ObjectMatrix<ICellData>();
        value.forEach((row, r) =>
            row.forEach((cell, c) => {
                cell = cell as ICellData;
                cellValue.setValue(r + range.startRow, c + range.startColumn, cell || {});
            })
        );

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            rangeData: [range],
            worksheetId,
            workbookId,
            cellValue: cellValue.getData(),
            options,
        };

        const undoMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, setRangeValuesMutationParams);
        const result = commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};

/**
 * en:
 *
 * The process of copying a range to another range is obtained by the following rules
 *
 * [The two-dimensional array composed of the content or format to be assigned] => [Target range]
 *
 * 1. 1 -> 1: 1 => 1
 * 2. N -> 1: N => N
 * 3. 1 -> N: N => N
 * 4. N1 -> N2:
 *     1) N1 <N2: If N2 is a multiple of N1 (X), N1 * X => N2; If not, N1 => N1 (refer to office excel, different from google sheet)
 *     2) N1> N2: N1 => N1
 *
 * The above four cases can be combined and processed as
 *
 * Case 1, 1/2/4-2 merged into N1 => N1
 * Case 2, 3/4-1 merge into N1 * X => N2 or Case 1
 *
 * In the end we only need to judge whether N2 is a multiple of N1
 *
 * zh:
 *
 * 处理复制一个范围到另一个范围，由以下规则得到
 *
 * [将要赋值的内容或者格式组成的二维数组] => [目标范围]
 *
 * 1. 1 -> 1 : 1 => 1
 * 2. N -> 1 : N => N
 * 3. 1 -> N : N => N
 * 4. N1 -> N2 :
 *     1) N1 < N2 : 如果N2是N1的倍数X, N1 * X => N2; 如果不是，N1 => N1(参考office excel，和google sheet不同)
 *     2) N1 > N2 : N1 => N1
 *
 * 上面四种情况，可以合并处理为
 * 情况一， 1/2/4-2合并为 N1 => N1
 * 情况二， 3/4-1合并为 N1 * X => N2 或者情况一
 *
 * 最终我们只需要判断N2是否是N1的倍数
 *
 */

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
