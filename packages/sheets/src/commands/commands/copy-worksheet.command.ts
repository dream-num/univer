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
import type { IUniverSheetsConfig } from '../../controllers/config.schema';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import {
    CommandType,
    generateRandomId,
    ICommandService,
    IConfigService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { defaultCopySheetSplitConfig, SHEETS_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { InsertSheetMutation, InsertSheetUndoMutationFactory } from '../mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../mutations/remove-sheet.mutation';
import { SetRangeValuesMutation } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

/**
 * Count the total number of cells in cellData
 */
function countCells(cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>): number {
    let count = 0;
    for (const rowKey of Object.keys(cellData)) {
        const rowData = cellData[Number(rowKey)];
        if (rowData) {
            count += Object.keys(rowData).length;
        }
    }
    return count;
}

/**
 * Split cellData into batches for SetRangeValuesMutation
 * @param unitId - The unit ID
 * @param subUnitId - The sub unit ID (sheet ID)
 * @param cellData - The cell data to split
 * @param batchSize - The maximum number of cells per batch
 * @param maxChunks - The maximum number of chunks allowed. If exceeded, batchSize will be adjusted.
 */
function splitCellDataIntoBatches(
    unitId: string,
    subUnitId: string,
    cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>,
    batchSize: number,
    maxChunks: number
): IMutationInfo<ISetRangeValuesMutationParams>[] {
    // Calculate actual batch size based on maxChunks limit
    const totalCells = countCells(cellData);
    const estimatedChunks = Math.ceil(totalCells / batchSize);
    const actualBatchSize = estimatedChunks > maxChunks
        ? Math.ceil(totalCells / maxChunks)
        : batchSize;
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

            if (cellCount >= actualBatchSize) {
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

// eslint-disable-next-line max-lines-per-function
function buildCopySheetMutations(
    accessor: IAccessor,
    workbook: Workbook,
    worksheet: ReturnType<Workbook['getActiveSheet']>,
    unitId: string,
    subUnitId: string,
    localeService: LocaleService,
    sheetInterceptorService: SheetInterceptorService
): ICopySheetMutationParams {
    const configService = accessor.get(IConfigService);
    const pluginConfig = configService.getConfig<IUniverSheetsConfig>(SHEETS_PLUGIN_CONFIG_KEY);
    const splitConfig = {
        ...defaultCopySheetSplitConfig,
        ...pluginConfig?.copySheetSplit,
    };

    const config = Tools.deepClone(worksheet!.getConfig());
    config.name = getCopyUniqueSheetName(workbook, localeService, config.name);
    const newSheetId = generateRandomId();
    config.id = newSheetId;
    const sheetIndex = workbook.getSheetIndex(worksheet!);

    const { cellData } = config;
    const cellCount = countCells(cellData);

    // Only split if the cell count exceeds the threshold
    const shouldSplit = cellCount >= splitConfig.splitThreshold;

    let insertSheetMutationParams: IInsertSheetMutationParams;
    let setRangeValuesMutations: IMutationInfo<ISetRangeValuesMutationParams>[] = [];
    let setRangeValuesUndoMutations: IMutationInfo<ISetRangeValuesMutationParams>[] = [];

    if (shouldSplit) {
        // Split mode: create empty sheet first, then set cell values in batches
        const sheetConfigWithoutCellData = { ...config, cellData: {} };
        insertSheetMutationParams = {
            index: sheetIndex + 1,
            sheet: sheetConfigWithoutCellData,
            unitId,
        };

        setRangeValuesMutations = splitCellDataIntoBatches(
            unitId,
            newSheetId,
            cellData,
            splitConfig.batchSize,
            splitConfig.maxChunks
        );

        setRangeValuesUndoMutations = setRangeValuesMutations.map((mutation) => ({
            id: SetRangeValuesMutation.id,
            params: {
                unitId,
                subUnitId: newSheetId,
                cellValue: createClearCellMatrix(mutation.params.cellValue),
            } as ISetRangeValuesMutationParams,
        }));
    } else {
        // No split: insert sheet with all cell data at once
        insertSheetMutationParams = {
            index: sheetIndex + 1,
            sheet: config,
            unitId,
        };
    }

    const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(
        accessor,
        insertSheetMutationParams
    );

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
