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

import type { IObjectArrayPrimitiveType, IObjectMatrixPrimitiveType } from '../../shared/object-matrix';
import type { BooleanNumber } from '../enum';
import type { ICellData } from './i-cell-data';
import type { IColumnData } from './i-column-data';
import type { IAutoFilter } from './i-filter';
import type { IFreeze } from './i-freeze';
import type { IRange, IRangeType } from './i-range';
import type { IRowData } from './i-row-data';

// TODO: 考虑将非通用配置，抽离到插件
// 比如 showGridlines 是 spreadsheet 特有的，而如果实现如普通表格，就不需要 showGridlines

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

    autoFilter?: IAutoFilter;

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
