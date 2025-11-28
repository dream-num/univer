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

import type { IAccessor, ICellData, ICommand, IMutationInfo, IObjectMatrixPrimitiveType, Nullable, Workbook } from '@univerjs/core';
import type { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../basics/interfaces/mutation-interface';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import {
    CommandType,
    generateRandomId,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { InsertSheetMutation, InsertSheetUndoMutationFactory } from '../mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../mutations/remove-sheet.mutation';
import { SetRangeValuesMutation } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

// Maximum number of cells per SetRangeValuesMutation to avoid overly large mutations
const COPY_SHEET_CELL_BATCH_SIZE = 10000;

/**
 * Split cellData into batches for SetRangeValuesMutation
 */
function splitCellDataIntoBatches(
    unitId: string,
    subUnitId: string,
    cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>,
    batchSize: number
): IMutationInfo<ISetRangeValuesMutationParams>[] {
    const mutations: IMutationInfo<ISetRangeValuesMutationParams>[] = [];
    let currentBatch: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};
    let cellCount = 0;

    const rows = Object.keys(cellData).map(Number).sort((a, b) => a - b);

    for (const row of rows) {
        const rowData = cellData[row];
        if (!rowData) continue;

        const cols = Object.keys(rowData).map(Number).sort((a, b) => a - b);
        for (const col of cols) {
            const cell = rowData[col];
            if (cell === undefined) continue;

            if (!currentBatch[row]) {
                currentBatch[row] = {};
            }
            currentBatch[row]![col] = cell;
            cellCount++;

            if (cellCount >= batchSize) {
                mutations.push({
                    id: SetRangeValuesMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        cellValue: currentBatch,
                    },
                });
                currentBatch = {};
                cellCount = 0;
            }
        }
    }

    // Push remaining cells
    if (cellCount > 0) {
        mutations.push({
            id: SetRangeValuesMutation.id,
            params: {
                unitId,
                subUnitId,
                cellValue: currentBatch,
            },
        });
    }

    return mutations;
}

/**
 * Create a clear cell matrix for undo operations (set all cells to null)
 */
function createClearCellMatrix(
    cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>> | undefined
): IObjectMatrixPrimitiveType<Nullable<ICellData>> {
    const clearMatrix: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};

    if (!cellValue) return clearMatrix;

    for (const rowKey of Object.keys(cellValue)) {
        const row = Number(rowKey);
        const rowData = cellValue[row];
        if (!rowData) continue;

        clearMatrix[row] = {};
        for (const colKey of Object.keys(rowData)) {
            const col = Number(colKey);
            clearMatrix[row]![col] = null;
        }
    }

    return clearMatrix;
}

export interface ICopySheetCommandParams {
    unitId?: string;
    subUnitId?: string;
}

const COPY_SHEET_COMMAND_ID = 'sheet.command.copy-sheet';

interface ICopySheetMutationParams {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
    unitId: string;
}

function buildCopySheetMutations(
    accessor: IAccessor,
    workbook: Workbook,
    worksheet: ReturnType<Workbook['getActiveSheet']>,
    unitId: string,
    subUnitId: string,
    localeService: LocaleService,
    sheetInterceptorService: SheetInterceptorService
): ICopySheetMutationParams {
    const config = Tools.deepClone(worksheet!.getConfig());
    config.name = getCopyUniqueSheetName(workbook, localeService, config.name);
    const newSheetId = generateRandomId();
    config.id = newSheetId;
    const sheetIndex = workbook.getSheetIndex(worksheet!);

    // Extract cellData from config and create an empty sheet first
    const { cellData } = config;
    const sheetConfigWithoutCellData = { ...config, cellData: {} };

    const insertSheetMutationParams: IInsertSheetMutationParams = {
        index: sheetIndex + 1,
        sheet: sheetConfigWithoutCellData,
        unitId,
    };

    const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(
        accessor,
        insertSheetMutationParams
    );

    // Split cellData into batches for SetRangeValuesMutation
    const setRangeValuesMutations = splitCellDataIntoBatches(
        unitId,
        newSheetId,
        cellData,
        COPY_SHEET_CELL_BATCH_SIZE
    );

    // Generate undo mutations for SetRangeValuesMutation (clear the cells)
    const setRangeValuesUndoMutations = setRangeValuesMutations.map((mutation) => ({
        id: SetRangeValuesMutation.id,
        params: {
            unitId,
            subUnitId: newSheetId,
            cellValue: createClearCellMatrix(mutation.params.cellValue),
        } as ISetRangeValuesMutationParams,
    }));

    const intercepted = sheetInterceptorService.onCommandExecute({
        id: COPY_SHEET_COMMAND_ID,
        params: { unitId, subUnitId, targetSubUnitId: config.id },
    });

    const redos: IMutationInfo[] = [
        ...(intercepted.preRedos ?? []),
        { id: InsertSheetMutation.id, params: insertSheetMutationParams },
        ...setRangeValuesMutations,
        ...intercepted.redos,
    ];

    const undos: IMutationInfo[] = [
        ...(intercepted.preUndos ?? []),
        { id: RemoveSheetMutation.id, params: removeSheetMutationParams },
        ...setRangeValuesUndoMutations,
        ...intercepted.undos,
    ];

    return { redos, undos, unitId };
}

export const CopySheetCommand: ICommand = {
    type: CommandType.COMMAND,
    id: COPY_SHEET_COMMAND_ID,
    handler: (accessor: IAccessor, params?: ICopySheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const localeService = accessor.get(LocaleService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) {
            return false;
        }

        const { workbook, worksheet, unitId, subUnitId } = target;
        const { redos, undos } = buildCopySheetMutations(
            accessor,
            workbook,
            worksheet,
            unitId,
            subUnitId,
            localeService,
            sheetInterceptorService
        );

        const insertResult = sequenceExecute(redos, commandService).result;

        if (insertResult) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }
        return false;
    },
};

// If Sheet1(Copy) already exists and you copy Sheet1, you should get Sheet1(Copy2)
export function getCopyUniqueSheetName(workbook: Workbook, localeService: LocaleService, name: string): string {
    let output = `${name} ${localeService.t('sheets.tabs.sheetCopy', '')}`;
    let count = 2;

    while (workbook.checkSheetName(output)) {
        output = `${name} ${localeService.t('sheets.tabs.sheetCopy', `${count}`)}`;
        count++;
    }
    return output;
}
