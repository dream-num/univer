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

import type { ISheetBlock, ISnapshot } from '@univerjs/protocol';

// FIXME use exported types from @univerjs/protocol
import type { WorkbookMeta, WorksheetMeta } from '@univerjs/protocol/lib/types/ts/univer/workbook.js';
import type { IObjectMatrixPrimitiveType } from '../../shared/object-matrix';
import type { IWorksheetData } from './i-worksheet-data';
import type { IWorkbookData } from './i-workbook-data';
import type { ICellData } from './i-cell-data';

export interface IWorksheetMetaObject extends Omit<WorksheetMeta, 'originalMeta'> {
    originalMeta: Uint8Array | string | Partial<IWorksheetData>;
}

export interface IWorkbookMetaObject extends Omit<WorkbookMeta, 'originalMeta' | 'sheets'> {
    originalMeta: Uint8Array | string | Partial<IWorkbookData>;
    sheets: {
        [key: string]: Partial<IWorksheetMetaObject>;
    };
}

export interface ISnapshotObject extends Omit<ISnapshot, 'workbook'> {
    workbook: Partial<IWorkbookMetaObject>;
}

export interface ISheetBlockData extends Omit<ISheetBlock, 'data'> {
    data: Uint8Array | string | IObjectMatrixPrimitiveType<ICellData>;
}

export interface ISheetBlockObject {
    [key: string]: Partial<ISheetBlockData>;
}

export interface ISnapshotSheetBlockObject {
    snapshot: Partial<ISnapshotObject>;
    sheetBlocks: ISheetBlockObject;
}

export enum SnapshotMetaType {
    BUFFER = 'BUFFER',
    STRING = 'STRING',
    OBJECT = 'OBJECT',
}
