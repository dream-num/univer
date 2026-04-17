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

import type { IDocumentMeta } from './doc';
import type { IResource } from './resource';

export enum CellValueType {
    UNKNOWN = 0,
    STRING = 1,
    NUMBER = 2,
    BOOLEAN = 3,
    FORCE_STRING = 4,
    UNRECOGNIZED = -1,
}

export interface IWorksheetMeta {
    type: number;
    id: string;
    name: string;
    rowCount: number;
    columnCount: number;
    /** The original meta data in JSON format. Cell data is excluded. */
    originalMeta: Uint8Array;
}

export interface IWorkbookMeta {
    unitID: string;
    rev: number;
    creator: string;
    name: string;
    sheetOrder: string[];
    /** The key is sheet id */
    sheets: { [key: string]: IWorksheetMeta };
    /**
     * Questions:  should snapshot server read the celldata?
     * map<string, univer.IResource> resources = 8; // The key is sheet id
     */
    resources: IResource[];
    /** The key is sheet id */
    blockMeta: { [key: string]: ISheetBlockMeta };
    /** The original meta data in JSON format. Cell data is excluded. */
    originalMeta: Uint8Array;
}

interface ICellValue {
    strV?: string | undefined;
    numV?: number | undefined;
    boolV?: boolean | undefined;
}

/** Represents the data for a cell. */
export interface ICellData {
    /** The value of the cell. */
    v:
    | ICellValue
    | undefined;
    /** The type of the cell value. */
    t: CellValueType;
    /** univer doc */
    p:
    | IDocumentMeta
    | undefined;
    /** style */
    s: string;
    /** formula */
    f: string;
    /** formula refId */
    si: string;
    /** formula ref, e.g. "A1:B2", reversed for array formulas */
    ref: string;
    /** New Excel formulas need to add prefixes for differentiation, e.g., _xlfn._xlws. _xlfn. _xlws. _xludf. */
    xf: string;
}

export interface ISheetBlock {
    /** block id, generate by backend server */
    id: string;
    startRow: number;
    endRow: number;
    data: Uint8Array;
}

export interface ISheetBlockMeta {
    sheetID: string;
    /** sheet block ids */
    blocks: string[];
}
