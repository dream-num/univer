import { IFormulaData, IFormulaDataItem } from '@univerjs/base-formula-engine';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    handleDeleteRangeMutation,
    handleInsertRangeMutation,
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IInsertColCommandParams,
    IInsertRowCommandParams,
    IMoveColsCommandParams,
    IMoveRangeCommandParams,
    IMoveRowsCommandParams,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveDownCommandParams,
    InsertRangeMoveRightCommand,
    InsertRangeMoveRightCommandParams,
    InsertRowCommand,
    IRemoveRowColCommandParams,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveRowCommand,
} from '@univerjs/base-sheets';
import { Dimension, ICommandInfo, ObjectMatrix } from '@univerjs/core';

export function offsetFormula(
    formulaData: IFormulaData,
    command: ICommandInfo,
    unitId: string,
    sheetId: string
): IFormulaData {
    const { id } = command;

    const formulaMatrix = new ObjectMatrix(formulaData[unitId][sheetId]);

    switch (id) {
        case MoveRangeCommand.id:
            handleMoveRange(formulaMatrix, command as ICommandInfo<IMoveRangeCommandParams>);
            break;
        case MoveRowsCommand.id:
            handleMoveRows(formulaMatrix, command as ICommandInfo<IMoveRowsCommandParams>);
            break;
        case MoveColsCommand.id:
            handleMoveCols(formulaMatrix, command as ICommandInfo<IMoveColsCommandParams>);
            break;
        case InsertRowCommand.id:
            handleInsertRow(formulaMatrix, command as ICommandInfo<IInsertRowCommandParams>);
            break;
        case InsertColCommand.id:
            handleInsertCol(formulaMatrix, command as ICommandInfo<IInsertColCommandParams>);
            break;
        case InsertRangeMoveRightCommand.id:
            handleInsertRangeMoveRight(formulaMatrix, command as ICommandInfo<InsertRangeMoveRightCommandParams>);
            break;
        case InsertRangeMoveDownCommand.id:
            handleInsertRangeMoveDown(formulaMatrix, command as ICommandInfo<InsertRangeMoveDownCommandParams>);
            break;
        case RemoveRowCommand.id:
            handleRemoveRow(formulaMatrix, command as ICommandInfo<IRemoveRowColCommandParams>);
            break;
        case RemoveColCommand.id:
            handleRemoveCol(formulaMatrix, command as ICommandInfo<IRemoveRowColCommandParams>);
            break;
        case DeleteRangeMoveUpCommand.id:
            handleDeleteRangeMoveUp(formulaMatrix, command as ICommandInfo<IDeleteRangeMoveUpCommandParams>);
            break;
        case DeleteRangeMoveLeftCommand.id:
            handleDeleteRangeMoveLeft(formulaMatrix, command as ICommandInfo<IDeleteRangeMoveLeftCommandParams>);
            break;
    }

    return formulaData;
}

function handleMoveRange(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<IMoveRangeCommandParams>
) {}

function handleMoveRows(formulaMatrix: ObjectMatrix<IFormulaDataItem>, command: ICommandInfo<IMoveRowsCommandParams>) {}

function handleMoveCols(formulaMatrix: ObjectMatrix<IFormulaDataItem>, command: ICommandInfo<IMoveColsCommandParams>) {}

function handleInsertRow(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<IInsertRowCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleInsertRangeMutation(formulaMatrix, [range], lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleInsertCol(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<IInsertColCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleInsertRangeMutation(formulaMatrix, [range], lastEndRow, lastEndColumn, Dimension.COLUMNS);
}

function handleInsertRangeMoveRight(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<InsertRangeMoveRightCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { ranges } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleInsertRangeMutation(formulaMatrix, ranges, lastEndRow, lastEndColumn, Dimension.COLUMNS);
}

function handleInsertRangeMoveDown(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<InsertRangeMoveDownCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { ranges } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleInsertRangeMutation(formulaMatrix, ranges, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleRemoveRow(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<IRemoveRowColCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { ranges } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleDeleteRangeMutation(formulaMatrix, ranges, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleRemoveCol(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<IRemoveRowColCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { ranges } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleDeleteRangeMutation(formulaMatrix, ranges, lastEndRow, lastEndColumn, Dimension.COLUMNS);
}

function handleDeleteRangeMoveUp(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<IDeleteRangeMoveUpCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { ranges } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleDeleteRangeMutation(formulaMatrix, ranges, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleDeleteRangeMoveLeft(
    formulaMatrix: ObjectMatrix<IFormulaDataItem>,
    command: ICommandInfo<IDeleteRangeMoveLeftCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { ranges } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleDeleteRangeMutation(formulaMatrix, ranges, lastEndRow, lastEndColumn, Dimension.COLUMNS);
}
