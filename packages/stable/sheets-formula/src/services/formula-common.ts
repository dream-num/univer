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

import type { ICellData, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';

export enum FormulaResultStatus {
    NOT_REGISTER = 1,
    SUCCESS,
    WAIT,
    ERROR,
}

export interface IOtherFormulaResult {
    result?: IObjectMatrixPrimitiveType<Nullable<ICellData>[][]>;
    status: FormulaResultStatus;
    formulaId: string;
    callbacks: Set<(value: IObjectMatrixPrimitiveType<Nullable<ICellData>[][]>) => void>;
    extra?: Record<string, any>;
}

export interface IFormulaInfo {
    id: string;
    text: string;
}
