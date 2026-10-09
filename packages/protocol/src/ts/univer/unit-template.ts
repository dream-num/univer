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

/** ICustomCellTemplate is the template used for make some drawing on sheet, like draw a cute mario XD. */
export interface ICustomCellTemplate {
    rowCount: number;
    colCount: number;
    rowHeight: number;
    colWidth: number;
    showGridlines: number;
}

/**
 * Initial worksheet dimensions for the `custom-sheet` template.
 * Each omitted field uses its built-in default independently.
 */
export interface ICustomSheetTemplate {
    /** Initial number of rows. Defaults to 1000. */
    rowCount?: number;
    /** Initial number of columns. Defaults to 20 (A–T); use 26 for A–Z. */
    columnCount?: number;
    /** Default row height in pixels. Defaults to 24. */
    defaultRowHeight?: number;
    /** Default column width in pixels. Defaults to 88. */
    defaultColumnWidth?: number;
    /** Width of the row-number header in pixels. Defaults to 46; an explicit 0 is preserved. */
    rowHeaderWidth?: number;
    /** Height of the column-letter header in pixels. Defaults to 20; an explicit 0 is preserved. */
    columnHeaderHeight?: number;
}
