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

import type { Direction, IAccessor, ICellData, IMutationInfo, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';
import type { IDiscreteRange } from '../../basics';

export enum AUTO_FILL_APPLY_TYPE {
    COPY = 'COPY',
    SERIES = 'SERIES',
    ONLY_FORMAT = 'ONLY_FORMAT',
    NO_FORMAT = 'NO_FORMAT',
}

export enum AUTO_FILL_DATA_TYPE {
    NUMBER = 'number',
    DATE = 'date',
    EXTEND_NUMBER = 'extendNumber',
    CHN_NUMBER = 'chnNumber',
    CHN_WEEK2 = 'chnWeek2',
    CHN_WEEK3 = 'chnWeek3',
    LOOP_SERIES = 'loopSeries',
    FORMULA = 'formula',
    OTHER = 'other',
}

export enum AUTO_FILL_HOOK_TYPE {
    APPEND = 'APPEND',
    DEFAULT = 'DEFAULT',
    ONLY = 'ONLY',
}

export interface IAutoFillLocation {
    source: IDiscreteRange;
    target: IDiscreteRange;
    unitId: string;
    subUnitId: string;
}

export interface ISheetAutoFillHook {
    id: string;
    priority?: number;
    type?: AUTO_FILL_HOOK_TYPE;
    bindUnit?: string;
    disable?: (location: IAutoFillLocation, direction: Direction, applyType: AUTO_FILL_APPLY_TYPE) => boolean;
    onBeforeFillData?(location: IAutoFillLocation, direction: Direction): AUTO_FILL_APPLY_TYPE | void;
    onFillData?(
        location: IAutoFillLocation,
        direction: Direction,
        applyType: AUTO_FILL_APPLY_TYPE
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onAfterFillData?(location: IAutoFillLocation, direction: Direction, applyType: AUTO_FILL_APPLY_TYPE): boolean | void;
    onBeforeSubmit?: (location: IAutoFillLocation, direction: Direction, applyType: AUTO_FILL_APPLY_TYPE, cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>) => void;
}

export type IAutoFillCopyDataInTypeIndexInfo = number[];

export interface IAutoFillCopyDataInType {
    data: Array<Nullable<ICellData>>;
    index: IAutoFillCopyDataInTypeIndexInfo;
}

export interface IAutoFillCopyDataPiece {
    [key: string]: IAutoFillCopyDataInType[];
}

export interface IAutoFillRuleConfirmedData {
    type?: string;
    cellData: Nullable<ICellData>;
}

export type AUTO_FILL_APPLY_FUNCTIONS = {
    [key in AUTO_FILL_APPLY_TYPE]?: (
        dataWithIndex: IAutoFillCopyDataInType,
        len: number,
        direction: Direction,
        copyDataPiece: IAutoFillCopyDataPiece,
        location?: IAutoFillLocation
    ) => Array<Nullable<ICellData>>;
};

export interface IAutoFillRule {
    type: string;
    match: (cellData: Nullable<ICellData>, accessor: IAccessor) => boolean;
    isContinue: (prev: IAutoFillRuleConfirmedData, cur: Nullable<ICellData>) => boolean;
    applyFunctions?: AUTO_FILL_APPLY_FUNCTIONS;
    priority: number;
}
