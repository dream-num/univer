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

import type { WorksheetMeta } from '@univerjs/protocol/lib/types/ts/univer/workbook.js';
import type { Nullable } from 'vitest';
import type { ILogContext } from '../log/context';
import type { IWorkbookData } from '../../types/interfaces/i-workbook-data';
import { SheetTypes } from '../../types/enum/sheet-types';
import type { IWorksheetData } from '../../types/interfaces/i-worksheet-data';
import type { ICellData } from '../../types/interfaces/i-cell-data';
import { LocaleType } from '../../types/enum/locale-type';
import type { IDocumentData } from '../../types/interfaces/i-document-data';
import type { ISheetBlockObject, ISnapshotObject, IWorksheetMetaObject } from '../../types/interfaces/snapshot';
import { SnapshotMetaType } from '../../types/interfaces/snapshot';
import {
    decodeDocOriginalMeta,
    decodeMetaFromBuffer,
    decodePartOfCellData,
    decodeWorksheetOtherMetas,
    encodeDocOriginalMeta,
    encodeMetaToBuffer,
    encodeWorkbookOtherMetas,
    encodeWorksheetOtherMetas,
    splitCellDataToBlocks,
} from './snapshot-utils';
import { ClientSnapshotServerService, type ISnapshotServerService } from './snapshot-server.service';

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

    const { unitID, rev, name, originalMeta } = documentMeta;

    const { body, documentStyle = {}, settings = {} } = decodeDocOriginalMeta(originalMeta);

    const documentData: IDocumentData = {
        id: unitID,
        rev,
        locale: LocaleType.EN_US,
        title: name,
        body,
        documentStyle,
        settings,
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

/**
 * The originalMeta value in the JSON data transmitted from the backend is in string format and needs to be converted to Uint8Array first to fully comply with the ISnapshot format.
 * @param snapshot
 * @returns
 */
export function transformSnapshotObjectMetaToBuffer(snapshot: Partial<ISnapshotObject>): Nullable<ISnapshot> {
    const workbook = snapshot.workbook;
    if (!workbook) return null;

    const sheets: {
        [key: string]: WorksheetMeta;
    } = {};

    if (workbook.sheets) {
        // Loop through sheets and convert originalMeta
        Object.keys(workbook.sheets).forEach((sheetKey) => {
            const sheet = workbook.sheets && workbook.sheets[sheetKey];

            if (!sheet) return;

            // Set the converted Uint8Array to originalMeta
            sheets[sheetKey] = {
                ...sheet,
                type: sheet.type || 0,
                id: sheet.id || '',
                name: sheet.name || '',
                rowCount: sheet.rowCount || 0,
                columnCount: sheet.columnCount || 0,
                originalMeta: encodeMetaToBuffer(sheet.originalMeta || ''),
            };
        });
    }

    const rev = snapshot.rev || workbook.rev || 0;
    const unitID = snapshot.unitID || workbook.unitID || '';

    return {
        ...snapshot,
        unitID,
        type: snapshot.type || 0,
        rev,
        doc: snapshot.doc || undefined,
        workbook: {
            ...workbook,
            unitID,
            rev,
            creator: workbook.creator || '',
            name: workbook.name || '',
            sheetOrder: workbook.sheetOrder || [],
            resources: workbook.resources || [],
            blockMeta: workbook.blockMeta || {},
            originalMeta: encodeMetaToBuffer(workbook.originalMeta || ''),
            sheets,
        },
    };
}

export function transformSheetBlockObjectMetaToBuffer(sheetBlocks: ISheetBlockObject): ISheetBlock[] {
    const sheetBlockArray: ISheetBlock[] = [];
    Object.keys(sheetBlocks).forEach((blockKey) => {
        const block = sheetBlocks[blockKey];
        sheetBlockArray.push({
            ...block,
            id: block.id || '',
            startRow: block.startRow || 0,
            endRow: block.endRow || 0,
            data: encodeMetaToBuffer(block.data || ''),
        });
    });
    return sheetBlockArray;
}

export function transformSnapshotObjectToWorkbookData(snapshot: Partial<ISnapshotObject>, sheetBlocks: ISheetBlockObject): Nullable<IWorkbookData> {
    const snapshotData = transformSnapshotObjectMetaToBuffer(snapshot);
    if (!snapshotData) return null;

    const blocks = transformSheetBlockObjectMetaToBuffer(sheetBlocks);

    return transformSnapshotToWorkbookData(snapshotData, blocks);
}

/**
 * Convert the Uint8Array in the snapshot to a string for easy transmission to the backend
 * @param snapshot
 * @returns
 */
export function transformSnapshotMetaToObject(snapshot: ISnapshot, snapshotMetaType: SnapshotMetaType): Nullable<ISnapshotObject> {
    const workbook = snapshot.workbook;
    if (!workbook) return null;

    const sheets: {
        [key: string]: Partial<IWorksheetMetaObject>;
    } = {};

    if (workbook.sheets) {
        // Loop through sheets and convert originalMeta
        Object.keys(workbook.sheets).forEach((sheetKey) => {
            const sheet = workbook.sheets[sheetKey];
            sheets[sheetKey] = {
                ...sheet,
                originalMeta: decodeMetaFromBuffer(sheet.originalMeta, snapshotMetaType),
            };
        });
    }

    return {
        ...snapshot,
        workbook: {
            ...workbook,
            originalMeta: decodeMetaFromBuffer(workbook.originalMeta, snapshotMetaType),
            sheets,
        },
    };
}

export function transformSheetBlockMetaToObject(sheetBlocks: ISheetBlock[], snapshotMetaType: SnapshotMetaType): ISheetBlockObject {
    const sheetBlockObject: ISheetBlockObject = {};
    sheetBlocks.forEach((block) => {
        sheetBlockObject[block.id] = {
            ...block,
            data: decodeMetaFromBuffer(block.data, snapshotMetaType),
        };
    });
    return sheetBlockObject;
}

export async function transformWorkbookDataToSnapshotObject(workbookData: IWorkbookData, snapshotMetaType: SnapshotMetaType = SnapshotMetaType.BUFFER): Promise<{ snapshot: ISnapshotObject; sheetBlocks: ISheetBlockObject }> {
    const context: ILogContext = {
        metadata: undefined,
    };

    const unitID = workbookData.id;
    const rev = workbookData.rev ?? 0;

    const snapshotService: ISnapshotServerService = new ClientSnapshotServerService();

    const { snapshot } = await transformWorkbookDataToSnapshot(context, workbookData, unitID, rev, snapshotService);

    const sheetBlocks = await getSheetBlocksFromSnapshot(snapshot, snapshotService);

    const snapshotObject = transformSnapshotMetaToObject(snapshot, snapshotMetaType);

    if (!snapshotObject) throw new Error('Failed to transform snapshot to object');

    return {
        snapshot: snapshotObject,
        sheetBlocks: transformSheetBlockMetaToObject(sheetBlocks, snapshotMetaType),
    };
}
