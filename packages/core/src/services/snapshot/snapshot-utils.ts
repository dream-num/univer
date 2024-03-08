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

import type { ISheetBlock } from '@univerjs/protocol';

import { b64DecodeUnicode } from '../../shared/coder';
import type { IWorksheetData } from '../../types/interfaces/i-worksheet-data';
import { Tools } from '../../shared/tools';
import type { IWorkbookData } from '../../types/interfaces/i-workbook-data';
import type { IDocumentData } from '../../types/interfaces/i-document-data';
import type { ICellData } from '../../types/interfaces/i-cell-data';
import type { IObjectMatrixPrimitiveType } from '../../shared/object-matrix';
import { ObjectMatrix } from '../../shared/object-matrix';

// Some properties are stored in the meta fields or are in sheet blocks.
// They can be found in `packages/collaboration/src/services/snapshot/snapshot-utils.ts`.

export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder();

/**
 * @param worksheet
 */
export function encodeWorksheetOtherMetas(worksheet: Partial<IWorksheetData>): Uint8Array {
    const cloned: Partial<IWorksheetData> = Tools.deepClone(worksheet);
    // Some properties are stored in the meta fields are in sheet blocks
    // so we need to delete them before serializing remaining properties.
    delete cloned.id;
    delete cloned.name;
    delete cloned.rowCount;
    delete cloned.columnCount;
    delete cloned.cellData;
    const meta = textEncoder.encode(JSON.stringify(cloned));
    return meta;
}

export function encodeWorkbookOtherMetas(workbook: IWorkbookData): Uint8Array {
    const cloned: Partial<IWorkbookData> = Tools.deepClone(workbook);
    // Some properties are stored in the meta fields are in sheet blocks
    // so we need to delete them before serializing remaining properties.
    delete cloned.id;
    delete cloned.rev;
    delete cloned.name;
    delete cloned.sheetOrder;
    delete cloned.sheets;
    const meta = textEncoder.encode(JSON.stringify(cloned));
    return meta;
}

export function encodeDocOriginalMeta(document: IDocumentData): Uint8Array {
    const cloned: Partial<IDocumentData> = Tools.deepClone(document);
    // Some properties are stored in the meta fields are in sheet blocks
    // so we need to delete them before serializing remaining properties.
    delete cloned.id;
    delete cloned.rev;
    delete cloned.title;
    delete cloned.resources;
    const meta = textEncoder.encode(JSON.stringify(cloned));
    return meta;
}

export function decodeWorksheetOtherMetas(buffer: Uint8Array): Partial<IWorksheetData> {
    return JSON.parse(textDecoder.decode(buffer));
}

export function decodeWorkbookOtherMetas(buffer: Uint8Array): Partial<IWorkbookData> {
    return JSON.parse(textDecoder.decode(buffer));
}

export function decodePartOfCellData(buffer: Uint8Array | string): IObjectMatrixPrimitiveType<ICellData> {
    if (typeof buffer === 'string') {
        return JSON.parse(b64DecodeUnicode(buffer));
    }

    return JSON.parse(textDecoder.decode(buffer));
}

export function decodeDocOriginalMeta(buffer: Uint8Array | string): Partial<IDocumentData> {
    if (typeof buffer === 'string') {
        return JSON.parse(b64DecodeUnicode(buffer));
    }

    return JSON.parse(textDecoder.decode(buffer));
}

const FRAGMENT_ROW_COUNT = 256;
export function splitCellDataToBlocks(
    cellData: IObjectMatrixPrimitiveType<ICellData>,
    maxColumn: number
): ISheetBlock[] {
    const utilObjectMatrix = new ObjectMatrix(cellData);
    const length = utilObjectMatrix.getLength();
    const blocks: ISheetBlock[] = [];

    // Store every 32 rows into a block even if some rows are empty.
    let i = 0;
    while (i < length) {
        const endRow = Math.min(i + FRAGMENT_ROW_COUNT, length - 1);
        const slice = utilObjectMatrix.getSlice(i, Math.min(i + FRAGMENT_ROW_COUNT, length - 1), 0, maxColumn);
        const data = serializeCellDataSlice(slice);

        blocks.push({
            id: Tools.generateRandomId(19, '0123456789'), // an random ID for client, this would be changed after the block is saved in the server
            startRow: i,
            endRow,
            data,
        });

        i += FRAGMENT_ROW_COUNT;
    }

    return blocks;
}

function serializeCellDataSlice(slice: ObjectMatrix<ICellData>): Uint8Array {
    const data = slice.getData();
    return textEncoder.encode(JSON.stringify(data));
}
