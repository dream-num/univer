import type { ICellData, IMutationInfo, IRange, Worksheet } from '@univerjs/core';
import { ObjectMatrix } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

export function checkCellContentInRanges(worksheet: Worksheet, ranges: IRange[]): boolean {
    return ranges.some((range) => checkCellContentInRange(worksheet, range));
}

export function checkCellContentInRange(worksheet: Worksheet, range: IRange): boolean {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

    let someCellGoingToBeRemoved = false;
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn) && worksheet.cellHasValue(cellData)) {
            someCellGoingToBeRemoved = true;
            return false;
        }
    });
    return someCellGoingToBeRemoved;
}

export function getClearContentMutationParamsForRanges(
    accessor: IAccessor,
    workbookId: string,
    worksheet: Worksheet,
    ranges: IRange[]
): {
    undos: IMutationInfo[];
    redos: IMutationInfo[];
} {
    const undos: IMutationInfo[] = [];
    const redos: IMutationInfo[] = [];

    const worksheetId = worksheet.getSheetId();

    // Use the following file as a reference.
    // packages/sheets/src/commands/commands/clear-selection-all.command.ts
    // packages/sheets/src/commands/mutations/set-range-values.mutation.ts
    ranges.forEach((range) => {
        const redoMatrix = getClearContentMutationParamForRange(worksheet, range);
        const redoMutationParams: ISetRangeValuesMutationParams = {
            workbookId,
            worksheetId,
            cellValue: redoMatrix.getData(),
        };
        const undoMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            redoMutationParams
        );

        undos.push({ id: SetRangeValuesMutation.id, params: undoMutationParams });
        redos.push({ id: SetRangeValuesMutation.id, params: redoMutationParams });
    });

    return {
        undos,
        redos,
    };
}

export function getClearContentMutationParamForRange(worksheet: Worksheet, range: IRange): ObjectMatrix<ICellData> {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);
    const redoMatrix = new ObjectMatrix<ICellData>();
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn)) {
            redoMatrix.setValue(row, col, null);
        }
    });

    return redoMatrix;
}
