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
    cloneWorksheetData,
    CommandType,
    generateRandomId,
    ICommandService,
    IConfigService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    sequenceExecute,
} from '@univerjs/core';
import { defaultCopySheetSplitConfig, SHEETS_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { CopySheetScheduleService } from '../../services/copy-sheet-schedule.service';
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
 * Returns the first chunk separately (to be included in InsertSheetMutation)
 * and remaining chunks (to be scheduled for idle execution)
 * @param unitId - The unit ID
 * @param subUnitId - The sub unit ID (sheet ID)
 * @param cellData - The cell data to split
 * @param batchSize - The maximum number of cells per batch
 * @returns Object containing firstChunkCellData and remainingMutations
 */
function splitCellDataIntoBatches(
    unitId: string,
    subUnitId: string,
    cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>,
    batchSize: number
): {
    firstChunkCellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
    remainingMutations: IMutationInfo<ISetRangeValuesMutationParams>[];
} {
    const batches: IObjectMatrixPrimitiveType<Nullable<ICellData>>[] = [];
    let currentBatch: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};
    let cellCount = 0;

    for (const rowKey in cellData) {
        const row = Number(rowKey);
        const rowData = cellData[row];
        if (!rowData) continue;

        const rowCellCount = Object.keys(rowData).length;

        // If adding this row would exceed the batch size, push current batch first
        if (cellCount > 0 && cellCount + rowCellCount > batchSize) {
            batches.push(currentBatch);
            currentBatch = {};
            cellCount = 0;
        }

        // Add entire row at once
        currentBatch[row] = rowData;
        cellCount += rowCellCount;

        // If batch is full, push it
        if (cellCount >= batchSize) {
            batches.push(currentBatch);
            currentBatch = {};
            cellCount = 0;
        }
    }

    // Push remaining cells
    if (cellCount > 0) {
        batches.push(currentBatch);
    }

    // First chunk goes into InsertSheetMutation
    const firstChunkCellData = batches.length > 0 ? batches[0] : {};

    // Remaining chunks become SetRangeValuesMutation (for idle scheduling)
    const remainingMutations: IMutationInfo<ISetRangeValuesMutationParams>[] = batches.slice(1).map((batch) => ({
        id: SetRangeValuesMutation.id,
        params: {
            unitId,
            subUnitId,
            cellValue: batch,
            __splitChunk__: true,
        },
    }));

    return { firstChunkCellData, remainingMutations };
}

export interface ICopySheetCommandParams {
    unitId?: string;
    subUnitId?: string;
}

const COPY_SHEET_COMMAND_ID = 'sheet.command.copy-sheet';

interface IBuildCopySheetResult {
    /** Remaining mutations to be scheduled for idle execution (local only, not serialized) */
    scheduledMutations: IMutationInfo<ISetRangeValuesMutationParams>[];
    redos: IMutationInfo[];
    undos: IMutationInfo[];
    unitId: string;
    /** New sheet ID for scheduling remaining mutations */
    newSheetId: string;
    /** Whether the sheet was split into chunks */
    isSplit: boolean;
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
): IBuildCopySheetResult {
    const configService = accessor.get(IConfigService);
    const pluginConfig = configService.getConfig<IUniverSheetsConfig>(SHEETS_PLUGIN_CONFIG_KEY);
    const splitConfig = {
        ...defaultCopySheetSplitConfig,
        ...pluginConfig?.copySheetSplit,
    };

    const config = cloneWorksheetData(worksheet!.getConfig());
    config.name = getCopyUniqueSheetName(workbook, localeService, config.name);
    const newSheetId = generateRandomId();
    config.id = newSheetId;
    const sheetIndex = workbook.getSheetIndex(worksheet!);

    const { cellData } = config;
    const cellCount = countCells(cellData);

    // Only split if the cell count exceeds the threshold
    const shouldSplit = cellCount >= splitConfig.splitThreshold;
    let insertSheetMutationParams: IInsertSheetMutationParams;
    let scheduledMutations: IMutationInfo<ISetRangeValuesMutationParams>[] = [];

    if (shouldSplit) {
        // Split mode: include first chunk in InsertSheetMutation, schedule the rest
        const { firstChunkCellData, remainingMutations } = splitCellDataIntoBatches(
            unitId,
            newSheetId,
            cellData,
            splitConfig.batchSize
        );

        // Insert sheet with first chunk of cell data
        const sheetConfigWithFirstChunk = { ...config, cellData: firstChunkCellData as IObjectMatrixPrimitiveType<ICellData> };
        insertSheetMutationParams = {
            index: sheetIndex + 1,
            sheet: sheetConfigWithFirstChunk,
            unitId,
        };

        // Remaining mutations will be scheduled for idle execution
        scheduledMutations = remainingMutations;
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

    // Redos only include InsertSheetMutation (with first chunk), remaining mutations are scheduled
    const redos: IMutationInfo[] = [
        ...(intercepted.preRedos ?? []),
        { id: InsertSheetMutation.id, params: insertSheetMutationParams },
        ...intercepted.redos,
    ];

    // Undo just removes the sheet - all scheduled mutations become irrelevant
    const undos: IMutationInfo[] = [
        ...(intercepted.preUndos ?? []),
        { id: RemoveSheetMutation.id, params: removeSheetMutationParams },
        ...intercepted.undos,
    ];

    console.log('===redos', {
         redos,
        undos,
        unitId,
        newSheetId,
        isSplit: shouldSplit,
        scheduledMutations,
    })

    return {
        redos,
        undos,
        unitId,
        newSheetId,
        isSplit: shouldSplit,
        scheduledMutations,
    };
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
        const copySheetScheduleService = accessor.get(CopySheetScheduleService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) {
            return false;
        }

        const { workbook, worksheet, unitId, subUnitId } = target;
        const { redos, undos, newSheetId, isSplit, scheduledMutations } = buildCopySheetMutations(
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
            // For split case:
            // - Undo: just remove the sheet (scheduled mutations become irrelevant)
            // - Redo: empty (don't support redo for large sheets to avoid performance issues)
            if (isSplit) {
                undoRedoService.pushUndoRedo({
                    unitID: unitId,
                    undoMutations: undos,
                    redoMutations: [], // No redo for split case
                });

                // Schedule remaining mutations for idle execution
                if (scheduledMutations.length > 0) {
                    // Immediately sync all mutations to changeset (syncOnly: true means sync but don't execute)
                    // The actual execution will happen in copySheetScheduleService with onlyLocal
                    for (const mutation of scheduledMutations) {
                        commandService.syncExecuteCommand(mutation.id, mutation.params, { syncOnly: true });
                    }

                    // Schedule local execution during idle time
                    copySheetScheduleService.scheduleMutations(unitId, newSheetId, scheduledMutations);
                }
            } else {
                undoRedoService.pushUndoRedo({
                    unitID: unitId,
                    undoMutations: undos,
                    redoMutations: redos,
                });
            }
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
