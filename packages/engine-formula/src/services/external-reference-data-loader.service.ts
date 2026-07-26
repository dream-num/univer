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

import type { IRange } from '@univerjs/core';
import type { ErrorType } from '../basics/error-type';
import type {
    FormulaUnitReferenceKind,
    IFormulaUnitReferenceResolution,
} from './unit-reference-resolver.service';
import { createIdentifier } from '@univerjs/core';

export interface IFormulaExternalReferenceLoadInput {
    hostUnitId: string;
    qualifier: string;
    referenceKind: FormulaUnitReferenceKind;
    token: string;
    tableName?: string;
    columnStruct?: string;
    resolution: IFormulaUnitReferenceResolution;
}

export interface IFormulaExternalReferenceDataLoader {
    load(input: IFormulaExternalReferenceLoadInput): Promise<ErrorType | void>;
    loadRuntimeRange?(input: {
        hostUnitId: string;
        unitId: string;
        sheetId: string;
        sheetName?: string;
        range: IRange;
    }): Promise<ErrorType | boolean | void>;
}

export const IFormulaExternalReferenceDataLoader =
    createIdentifier<IFormulaExternalReferenceDataLoader>('univer.formula.external-reference-data-loader');

export class NoopFormulaExternalReferenceDataLoader implements IFormulaExternalReferenceDataLoader {
    async load(): Promise<void> {}
}
