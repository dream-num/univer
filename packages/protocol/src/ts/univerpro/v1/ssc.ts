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

import type { IError } from '../../univer/constants/errors';
import type { IRange } from '../../univer/range';
import type { ITableInfo } from '../../univer/snapshot';
import type { ISheetBlockMeta } from '../../univer/workbook';

export enum responseDataMode {
    /** none - no data, default */
    none = 0,
    /** all - all data */
    all = 1,
    /** sample - sample data */
    sample = 2,
    UNRECOGNIZED = -1,
}

export interface IGetPreprocessRangesRequest {
    unitId: string;
    rev: number;
    /** use string, see responseDataMode enum, default is "none" */
    responseDataMode?: string | undefined;
}

export interface ITableInfoList {
    tableInfos: ITableInfo[];
}

export interface IGetPreprocessRangesResponse {
    error: IError | undefined;
    tableInfo: { [key: string]: ITableInfoList };
}

export interface IGetValuesRequest {
    workbookId: string;
    worksheetId: string;
    range: IRange | undefined;
}

export interface IGetValuesResponse {
    error:
    | IError
    | undefined;
    /** A matrix of values in JSON format. */
    value: string;
}

export interface IComputeRequest {
    /** The id of the unit to be computed. */
    workbookId: string;
    /**
     * The revision of the unit to be computed. If not specified or set to 0, the SSC service
     * will fetch the latest version at the request time.
     */
    revision: number;
    /** Timeout in milliseconds. Default is 30s. */
    timeout: number;
}

export interface IComputeResponse {
    error:
    | IError
    | undefined;
    /** Of which revision the unit is processed on. */
    revision: number;
    sscBlock: { [key: string]: ISheetBlockMeta };
}
