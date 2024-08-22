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

import type { ICellData, IRowData } from '@univerjs/protocol';
import type { Nullable } from 'vitest';
import type { LocaleType } from '../types/enum/locale-type';
import type { IStyleData } from '../types/interfaces/i-style-data';
import type { Resources } from '../types/interfaces/resource';
import type { IObjectArrayPrimitiveType, IObjectMatrixPrimitiveType } from '../shared';
import type { BooleanNumber } from '../types/enum';
import type { IColumnData, IFreeze, IRange, IRangeType } from '../types/interfaces';

/**
 * Snapshot of a workbook.
 */
export interface IWorkbookData {
    /**
     * Id of the Univer Sheet.
     */
    id: string;

    /**
     * Revision of this spreadsheet. Used in collaborated editing. Starts from one.
     * @ignore
     */
    rev?: number;

    /**
     * Name of the Univer Sheet.
     */
    name: string;

    /**
     * Version of Univer model definition.
     */
    appVersion: string;

    /**
     * Locale of the document.
     */
    locale: LocaleType;

    /**
     * Style references.
     */
    styles: Record<string, Nullable<IStyleData>>;

    /** Ids of {@link IWorksheetData}s of this Univer Sheet in sequence order. */
    sheetOrder: string[];

    /**
     * Data of each {@link IWorksheetData} in this Univer Sheet.
     */
    sheets: { [sheetId: string]: Partial<IWorksheetData> };

    /**
     * Resources of the Univer Sheet. It is used to store the data of other plugins.
     */
    resources?: Resources;
}

/**
 * Snapshot of a worksheet.
 */
export interface IWorksheetData {
    /**
     * Id of the worksheet. This should be unique and immutable across the lifecycle of the worksheet.
     */
    id: string;

    /** Name of the sheet. */
    name: string;

    tabColor: string;

    /**
     * Determine whether the sheet is hidden.
     *
     * @remarks
     * See {@link BooleanNumber| the BooleanNumber enum} for more details.
     *
     * @defaultValue `BooleanNumber.FALSE`
     */
    hidden: BooleanNumber;

    freeze: IFreeze;

    rowCount: number;
    columnCount: number;
    zoomRatio: number;
    scrollTop: number;
    scrollLeft: number;
    defaultColumnWidth: number;
    defaultRowHeight: number;

    /** All merged cells in this worksheet. */
    mergeData: IRange[];

    /** A matrix storing cell contents by row and column index. */
    cellData: IObjectMatrixPrimitiveType<ICellData>;
    rowData: IObjectArrayPrimitiveType<Partial<IRowData>>;
    columnData: IObjectArrayPrimitiveType<Partial<IColumnData>>;

    rowHeader: {
        width: number;
        hidden?: BooleanNumber;
    };

    columnHeader: {
        height: number;
        hidden?: BooleanNumber;
    };

    showGridlines: BooleanNumber;

    /** @deprecated */
    selections: IRangeType[];

    rightToLeft: BooleanNumber;
}
