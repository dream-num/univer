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

import type {
    ICommandInfo,
    Nullable,
    Workbook,
} from '@univerjs/core';

import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';

import type {
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IInsertColCommandParams,
    IInsertRowCommandParams,
    IMoveColsCommandParams,
    IMoveRangeCommandParams,
    IMoveRowsCommandParams,
    InsertRangeMoveDownCommandParams,
    InsertRangeMoveRightCommandParams,
    IRemoveRowColCommandParams,
    IRemoveSheetCommandParams,
    ISetWorksheetNameCommandParams,
} from '@univerjs/sheets';
import {
    RANGE_TYPE,
} from '@univerjs/core';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveDefinedNameCommand,
    RemoveRowCommand,
    RemoveSheetCommand,
    SetDefinedNameCommand,
    SetWorksheetNameCommand,
} from '@univerjs/sheets';
import { FormulaReferenceMoveType, type IFormulaReferenceMoveParam } from './ref-range-formula';

export function getReferenceMoveParams(workbook: Workbook, command: ICommandInfo) {
    const { id } = command;
    let result: Nullable<IFormulaReferenceMoveParam> = null;

    switch (id) {
        case MoveRangeCommand.id:
            result = handleRefMoveRange(command as ICommandInfo<IMoveRangeCommandParams>, workbook);
            break;
        case MoveRowsCommand.id:
            result = handleRefMoveRows(command as ICommandInfo<IMoveRowsCommandParams>, workbook);
            break;
        case MoveColsCommand.id:
            result = handleRefMoveCols(command as ICommandInfo<IMoveColsCommandParams>, workbook);
            break;
        case InsertRowCommand.id:
            result = handleRefInsertRow(command as ICommandInfo<IInsertRowCommandParams>);
            break;
        case InsertColCommand.id:
            result = handleRefInsertCol(command as ICommandInfo<IInsertColCommandParams>);
            break;
        case InsertRangeMoveRightCommand.id:
            result = handleRefInsertRangeMoveRight(command as ICommandInfo<InsertRangeMoveRightCommandParams>, workbook);
            break;
        case InsertRangeMoveDownCommand.id:
            result = handleRefInsertRangeMoveDown(command as ICommandInfo<InsertRangeMoveDownCommandParams>, workbook);
            break;
        case RemoveRowCommand.id:
            result = handleRefRemoveRow(command as ICommandInfo<IRemoveRowColCommandParams>, workbook);
            break;
        case RemoveColCommand.id:
            result = handleRefRemoveCol(command as ICommandInfo<IRemoveRowColCommandParams>, workbook);
            break;
        case DeleteRangeMoveUpCommand.id:
            result = handleRefDeleteRangeMoveUp(command as ICommandInfo<IDeleteRangeMoveUpCommandParams>, workbook);
            break;
        case DeleteRangeMoveLeftCommand.id:
            result = handleRefDeleteRangeMoveLeft(command as ICommandInfo<IDeleteRangeMoveLeftCommandParams>, workbook);
            break;
        case SetWorksheetNameCommand.id:
            result = handleRefSetWorksheetName(command as ICommandInfo<ISetWorksheetNameCommandParams>, workbook);
            break;
        case RemoveSheetCommand.id:
            result = handleRefRemoveWorksheet(command as ICommandInfo<IRemoveSheetCommandParams>, workbook);
            break;
        case SetDefinedNameCommand.id:
            result = handleRefSetDefinedName(command as ICommandInfo<ISetDefinedNameMutationParam>, workbook);
            break;
        case RemoveDefinedNameCommand.id:
            result = handleRefRemoveDefinedName(command as ICommandInfo<ISetDefinedNameMutationParam>, workbook);
            break;
    }

    return result;
}

function getCurrentSheetInfo(workbook: Workbook) {
    const unitId = workbook.getUnitId();
    const sheetId = workbook.getActiveSheet()?.getSheetId() || '';

    return {
        unitId,
        sheetId,
    };
}

function handleRefMoveRange(command: ICommandInfo<IMoveRangeCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { fromRange, toRange } = params;
    if (!fromRange || !toRange) return null;

    const { unitId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.MoveRange,
        from: fromRange,
        to: toRange,
        unitId,
        sheetId,
    };
}

function handleRefMoveRows(command: ICommandInfo<IMoveRowsCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const {
        fromRange: { startRow: fromStartRow, endRow: fromEndRow },
        toRange: { startRow: toStartRow, endRow: toEndRow },
    } = params;

    const unitId = workbook.getUnitId();
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) return null;

    const sheetId = worksheet.getSheetId();

    const from = {
        startRow: fromStartRow,
        startColumn: 0,
        endRow: fromEndRow,
        endColumn: worksheet.getColumnCount() - 1,
        rangeType: RANGE_TYPE.ROW,
    };
    const to = {
        startRow: toStartRow,
        startColumn: 0,
        endRow: toEndRow,
        endColumn: worksheet.getColumnCount() - 1,
        rangeType: RANGE_TYPE.ROW,
    };

    return {
        type: FormulaReferenceMoveType.MoveRows,
        from,
        to,
        unitId,
        sheetId,
    };
}

function handleRefMoveCols(command: ICommandInfo<IMoveColsCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const {
        fromRange: { startColumn: fromStartCol, endColumn: fromEndCol },
        toRange: { startColumn: toStartCol, endColumn: toEndCol },
    } = params;

    const unitId = workbook.getUnitId();
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) return null;

    const sheetId = worksheet.getSheetId();

    const from = {
        startRow: 0,
        startColumn: fromStartCol,
        endRow: worksheet.getRowCount() - 1,
        endColumn: fromEndCol,
        rangeType: RANGE_TYPE.COLUMN,
    };
    const to = {
        startRow: 0,
        startColumn: toStartCol,
        endRow: worksheet.getRowCount() - 1,
        endColumn: toEndCol,
        rangeType: RANGE_TYPE.COLUMN,
    };

    return {
        type: FormulaReferenceMoveType.MoveCols,
        from,
        to,
        unitId,
        sheetId,
    };
}

function handleRefInsertRow(command: ICommandInfo<IInsertRowCommandParams>) {
    const { params } = command;
    if (!params) return null;

    const { range, unitId, subUnitId } = params;
    return {
        type: FormulaReferenceMoveType.InsertRow,
        range,
        unitId,
        sheetId: subUnitId,
    };
}

function handleRefInsertCol(command: ICommandInfo<IInsertColCommandParams>) {
    const { params } = command;
    if (!params) return null;

    const { range, unitId, subUnitId } = params;
    return {
        type: FormulaReferenceMoveType.InsertColumn,
        range,
        unitId,
        sheetId: subUnitId,
    };
}

function handleRefInsertRangeMoveRight(command: ICommandInfo<InsertRangeMoveRightCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { range } = params;
    const { unitId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.InsertMoveRight,
        range,
        unitId,
        sheetId,
    };
}

function handleRefInsertRangeMoveDown(command: ICommandInfo<InsertRangeMoveDownCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { range } = params;
    const { unitId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.InsertMoveDown,
        range,
        unitId,
        sheetId,
    };
}

function handleRefRemoveRow(command: ICommandInfo<IRemoveRowColCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { range } = params;
    const { unitId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.RemoveRow,
        range,
        unitId,
        sheetId,
    };
}

function handleRefRemoveCol(command: ICommandInfo<IRemoveRowColCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { range } = params;
    const { unitId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.RemoveColumn,
        range,
        unitId,
        sheetId,
    };
}

function handleRefDeleteRangeMoveUp(command: ICommandInfo<IDeleteRangeMoveUpCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { range } = params;
    const { unitId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.DeleteMoveUp,
        range,
        unitId,
        sheetId,
    };
}

function handleRefDeleteRangeMoveLeft(command: ICommandInfo<IDeleteRangeMoveLeftCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { range } = params;
    const { unitId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.DeleteMoveLeft,
        range,
        unitId,
        sheetId,
    };
}

function handleRefSetWorksheetName(command: ICommandInfo<ISetWorksheetNameCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { unitId, subUnitId, name } = params;

    const { unitId: workbookId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.SetName,
        unitId: unitId || workbookId,
        sheetId: subUnitId || sheetId,
        sheetName: name,
    };
}

function handleRefRemoveWorksheet(command: ICommandInfo<IRemoveSheetCommandParams>, workbook: Workbook) {
    const { params } = command;
    if (!params) return null;

    const { unitId, subUnitId } = params;

    const { unitId: workbookId, sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.RemoveSheet,
        unitId: unitId || workbookId,
        sheetId: subUnitId || sheetId,
    };
}

function handleRefSetDefinedName(command: ICommandInfo<ISetDefinedNameMutationParam>, workbook: Workbook): Nullable<IFormulaReferenceMoveParam> {
    const { params } = command;
    if (!params) return null;

    const { unitId, name, id } = params;

    const { sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.SetDefinedName,
        unitId,
        sheetId,
        definedName: name,
        definedNameId: id,
    };
}

function handleRefRemoveDefinedName(command: ICommandInfo<ISetDefinedNameMutationParam>, workbook: Workbook): Nullable<IFormulaReferenceMoveParam> {
    const { params } = command;
    if (!params) return null;

    const { unitId, name, id } = params;

    const { sheetId } = getCurrentSheetInfo(workbook);

    return {
        type: FormulaReferenceMoveType.RemoveDefinedName,
        unitId,
        sheetId,
        definedName: name,
        definedNameId: id,
    };
}
