/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IDocumentMeta, IGetSheetBlockRequest, ISheetBlock, ISheetBlockMeta, ISnapshot, IWorkbookMeta, IWorksheetMeta } from '@univerjs/protocol';
import { ErrorCode, isError, UniverType } from '@univerjs/protocol';

import type { ILogContext } from '../log/context';
import type { IWorkbookData } from '../../types/interfaces/i-workbook-data';
import { SheetTypes } from '../../types/enum/sheet-types';
import type { IWorksheetData } from '../../types/interfaces/i-worksheet-data';
import type { ICellData } from '../../types/interfaces/i-cell-data';
import { LocaleType } from '../../types/enum/locale-type';
import type { IDocumentData } from '../../types/interfaces/i-document-data';
import {
    decodeDocOriginalMeta,
    decodePartOfCellData,
    decodeWorksheetOtherMetas,
    encodeDocOriginalMeta,
    encodeWorkbookOtherMetas,
    encodeWorksheetOtherMetas,
    splitCellDataToBlocks,
} from './snapshot-utils';
import type { ISnapshotServerService } from './snapshot-server.service';

export async function generateTemporarySnap(
    context: ILogContext,
    workbook: IWorkbookData,
    unitID: string,
    rev: number,
    snapshotService: ISnapshotServerService
): Promise<{
        snapshotRes: ISnapshot;
    }> {
    const blockMeta: { [key: string]: ISheetBlockMeta } = {};

    // Deal with worksheets and their blocks.
    const sheetMetas: { [key: string]: IWorksheetMeta } = {};
    const blocksSaveSuccess = await Promise.all(
        Object.entries(workbook.sheets).map(async ([sheetID, worksheet]) => {
            const sheetMeta: IWorksheetMeta = {
                id: worksheet.id!,
                type: SheetTypes.GRID,
                name: worksheet.name!,
                rowCount: worksheet.rowCount!,
                columnCount: worksheet.columnCount!,
                originalMeta: encodeWorksheetOtherMetas(worksheet),
            };

            sheetMetas[sheetID] = sheetMeta;

            // Trigger RPC and store the result in sheetBlocks.
            if (worksheet.cellData) {
                const sheetBlocks = splitCellDataToBlocks(worksheet.cellData, worksheet.rowCount!);
                const responses = await Promise.all(
                    sheetBlocks.map((block) =>
                        snapshotService.saveSheetBlock(context, {
                            unitID,
                            type: UniverType.UNIVER_SHEET,
                            block,
                        })
                    )
                );

                if (responses.some((response) => response.error?.code !== ErrorCode.OK)) {
                    return false;
                }

                blockMeta[sheetID] = {
                    sheetID,
                    blocks: responses.map((response) => response.blockID),
                };
            }

            return true;
        })
    );

    if (!blocksSaveSuccess) {
        throw new Error('[transformWorkbookDataToSnapshot()]: Failed to save sheet blocks.');
    }

    const originalMeta = encodeWorkbookOtherMetas(workbook);
    const workbookMeta: IWorkbookMeta = {
        unitID: workbook.id,
        rev,
        creator: '',
        name: workbook.name,
        sheetOrder: workbook.sheetOrder,
        sheets: sheetMetas,
        blockMeta, // this should not be empty
        resources: workbook.resources || [],
        originalMeta,
    };
    const snapshotRes: ISnapshot = {
        unitID,
        rev: workbookMeta.rev,
        type: UniverType.UNIVER_SHEET,
        workbook: workbookMeta,
        doc: undefined,
    };

    return {
        snapshotRes,
    };
}

// TODO@wzhudev: How to reuse blocks?

export async function transformWorkbookDataToSnapshot(
    context: ILogContext,
    workbook: IWorkbookData,
    unitID: string,
    rev: number,
    snapshotService: ISnapshotServerService
): Promise<{
        snapshot: ISnapshot;
    }> {
    // Gather sheet blocks info for worksheets.
    const blockMeta: { [key: string]: ISheetBlockMeta } = {};

    // Deal with worksheets and their blocks.
    const sheetMetas: { [key: string]: IWorksheetMeta } = {};
    const blocksSaveSuccess = await Promise.all(
        Object.entries(workbook.sheets).map(async ([sheetID, worksheet]) => {
            const sheetMeta: IWorksheetMeta = {
                id: worksheet.id!,
                type: SheetTypes.GRID,
                name: worksheet.name!,
                rowCount: worksheet.rowCount!,
                columnCount: worksheet.columnCount!,
                originalMeta: encodeWorksheetOtherMetas(worksheet),
            };

            sheetMetas[sheetID] = sheetMeta;

            // Trigger RPC and store the result in sheetBlocks.
            if (worksheet.cellData) {
                const sheetBlocks = splitCellDataToBlocks(worksheet.cellData, worksheet.rowCount!);
                const responses = await Promise.all(
                    sheetBlocks.map((block) =>
                        snapshotService.saveSheetBlock(context, {
                            unitID,
                            type: UniverType.UNIVER_SHEET,
                            block,
                        })
                    )
                );

                if (responses.some((response) => response.error?.code !== ErrorCode.OK)) {
                    return false;
                }

                blockMeta[sheetID] = {
                    sheetID,
                    blocks: responses.map((response) => response.blockID),
                };
            }

            return true;
        })
    );

    if (!blocksSaveSuccess) {
        throw new Error('[transformWorkbookDataToSnapshot()]: Failed to save sheet blocks.');
    }

    const originalMeta = encodeWorkbookOtherMetas(workbook);
    const workbookMeta: IWorkbookMeta = {
        unitID: workbook.id,
        rev,
        creator: '',
        name: workbook.name,
        sheetOrder: workbook.sheetOrder,
        sheets: sheetMetas,
        blockMeta, // this should not be empty
        resources: workbook.resources || [],
        originalMeta,
    };
    const snapshot: ISnapshot = {
        unitID,
        rev: workbookMeta.rev,
        type: UniverType.UNIVER_SHEET,
        workbook: workbookMeta,
        doc: undefined,
    };

    const saveResult = await snapshotService.saveSnapshot(context, {
        unitID,
        type: UniverType.UNIVER_SHEET,
        snapshot,
    });

    if (isError(saveResult.error)) {
        throw new Error(
            `transformWorkbookDataToSnapshot(): Failed to save snapshot.\nErrorCode: ${saveResult.error?.code}:${saveResult.error?.message}`
        );
    }

    return {
        snapshot,
    };
}

// NOTE: performance of this method is pretty suspicious.
/**
 * Assemble a snapshot to a workbook.
 * @param snapshot
 * @param sheetBlocks
 */
export function transformSnapshotToWorkbookData(
    snapshot: ISnapshot,
    sheetBlocks: ISheetBlock[],
    _context?: ILogContext
): IWorkbookData {
    const workbookMeta = snapshot.workbook;
    if (!workbookMeta) {
        throw new Error('');
    }

    // Deal with worksheets.
    const sheetMap: { [key: string]: Partial<IWorksheetData> } = {};
    Object.entries(workbookMeta.sheets).forEach(([sheetID, sheetMeta]) => {
        const otherMeta = decodeWorksheetOtherMetas(sheetMeta.originalMeta);
        sheetMap[sheetID] = {
            id: sheetMeta.id,
            name: sheetMeta.name,
            rowCount: sheetMeta.rowCount,
            columnCount: sheetMeta.columnCount,
            ...otherMeta,
        };
    });

    // Deal with sheet blocks.
    const sheetBlocksMap = new Map<string, ISheetBlock>();
    sheetBlocks.forEach((block) => {
        sheetBlocksMap.set(block.id, block);
    });

    if (workbookMeta.blockMeta) {
        Object.entries(workbookMeta.blockMeta).forEach(([sheetID, blocksOfSheet]) => {
            const worksheetConfig = sheetMap[sheetID];
            worksheetConfig.cellData = {};

            const blocks: ISheetBlock[] = [];
            blocksOfSheet.blocks?.forEach((blockID) => {
                const block = sheetBlocksMap.get(blockID);
                if (block) {
                    blocks.push(block);
                } else {
                    throw new Error('');
                }
            });

            blocks.forEach((block) => {
                const partOfCellData = decodePartOfCellData(block.data);
                Object.entries(partOfCellData).forEach(([rowNumber, rowData]) => {
                    const row: { [key: number]: ICellData } = (worksheetConfig.cellData![+rowNumber as number] = {});
                    Object.entries(rowData).forEach(([columnNumber, cellData]) => {
                        row[+columnNumber as number] = cellData as ICellData;
                    });
                });
            });
        });
    }

    // Deal with workbook meta
    const otherMeta = decodeWorksheetOtherMetas(workbookMeta.originalMeta);
    const workbookData: IWorkbookData = {
        id: snapshot.unitID,
        rev: workbookMeta.rev,
        name: workbookMeta.name,
        sheetOrder: workbookMeta.sheetOrder,
        appVersion: '',
        locale: LocaleType.EN_US,
        sheets: sheetMap,
        styles: {},
        resources: workbookMeta.resources || [],
        ...otherMeta,
    };

    return workbookData;
}

export function transformSnapshotToDocumentData(snapshot: ISnapshot): IDocumentData {
    const documentMeta = snapshot.doc;
    if (documentMeta == null) {
        throw new Error('transformSnapshotToDocumentData(): snapshot.doc is undefined.');
    }

    const { unitID, rev, name, originalMeta, resources = [] } = documentMeta;

    const { body, documentStyle = {}, settings = {}, drawings = {}, drawingsOrder = [] } = decodeDocOriginalMeta(originalMeta);

    const documentData: IDocumentData = {
        id: unitID,
        rev,
        locale: LocaleType.EN_US,
        title: name,
        body,
        documentStyle,
        settings,
        drawings,
        drawingsOrder,
        resources,
    };

    return documentData;
}
export async function transformDocumentDataToSnapshot(
    context: ILogContext,
    document: IDocumentData,
    unitID: string,
    rev: number,
    snapshotService: ISnapshotServerService
): Promise<{ snapshot: ISnapshot }> {
    const documentMeta: IDocumentMeta = {
        unitID: document.id,
        rev,
        creator: '',
        name: document.title ?? '',
        resources: document.resources || [],
        originalMeta: encodeDocOriginalMeta(document),
    };
    const snapshot: ISnapshot = {
        unitID,
        rev: documentMeta.rev,
        type: UniverType.UNIVER_DOC,
        workbook: undefined,
        doc: documentMeta,
    };

    const saveResult = await snapshotService.saveSnapshot(context, {
        unitID,
        type: UniverType.UNIVER_DOC,
        snapshot,
    });

    if (isError(saveResult.error)) {
        throw new Error(
            `transformDocumentDataToSnapshot(): Failed to save snapshot.\nErrorCode: ${saveResult.error?.code}:${saveResult.error?.message}`
        );
    }

    return {
        snapshot,
    };
}

/**
 *
 * @param snapshot
 * @param snapshotService
 * @returns
 */
export async function getSheetBlocksFromSnapshot(snapshot: ISnapshot, snapshotService: ISnapshotServerService) {
    const workbookMeta = snapshot.workbook;

    if (!workbookMeta) {
        throw new Error('Workbook metadata is not available');
    }

    const blocks: ISheetBlock[] = [];
    const promises: Promise<void>[] = [];

    Object.entries(workbookMeta.blockMeta).forEach(([sheetID, blocksOfSheet]) => {
        const blockPromises = blocksOfSheet.blocks.map(async (blockID) => {
            const params: IGetSheetBlockRequest = {
                unitID: workbookMeta.unitID,
                type: UniverType.UNIVER_SHEET,
                blockID,
            };
            const { block } = await snapshotService.getSheetBlock({}, params);
            if (block) {
                blocks.push(block);
            } else {
                throw new Error('Block not found');
            }
        });
        promises.push(...blockPromises);
    });

    await Promise.all(promises);
    return blocks;
}
