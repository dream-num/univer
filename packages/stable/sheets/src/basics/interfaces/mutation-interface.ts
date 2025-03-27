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

import type {
    Dimension,
    ICellData,
    IColumnData,
    IObjectArrayPrimitiveType,
    IObjectMatrixPrimitiveType,
    IRange,
    IRowData,
    IWorksheetData,
    Nullable,
} from '@univerjs/core';

/** Params of `RemoveSheetMutation` */
export interface IRemoveSheetMutationParams {
    subUnitId: string;
    unitId: string;
    subUnitName: string;
}

/** Params of `InsertSheetMutation` */
export interface IInsertSheetMutationParams {
    index: number;
    sheet: IWorksheetData;
    unitId: string;
}

/** Params of InsertRowMutation */
export interface IInsertRowMutationParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    rowInfo?: IObjectArrayPrimitiveType<IRowData>;
}

/** Params of InsertColMutation */
export interface IInsertColMutationParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    colInfo?: IObjectArrayPrimitiveType<IColumnData>;
}

/** Params of InsertRowMutation */
export interface IRemoveRowsMutationParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
}

/** Params of InsertColMutation */
export interface IRemoveColMutationParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
}

/** Params of DeleteRange */
export interface IDeleteRangeMutationParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    shiftDimension: Dimension;
}

/** Params of InsertRange */
export interface IInsertRangeMutationParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    shiftDimension: Dimension;
    cellValue?: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
}

/** Params of RemoveWorksheetMergeMutation */
export interface IRemoveWorksheetMergeMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

/** Params of AddWorksheetMergeMutation */
export interface IAddWorksheetMergeMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}
/** Params of AddWorksheetMergeMutation */
export interface IWorksheetRangeThemeStyleMutationParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    themeName: string;
}
