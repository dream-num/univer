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

import type { ICellData } from '@univerjs/core';

export const DOC_FORMULA_RESOURCE_KEY = 'DOC_FORMULA_RESOURCE';

/**
 * This interface represents a single formula entity in a Univer Doc.
 */
export interface IDocFormulaData {
    /** Id of this formula. It should be unique in a single document, and bound to the custom range's id. */
    rangeId: string;

    /**
     * Raw formula string. For example `=SUM(A1:B4)`.
     */
    f: string;

    /**
     * Formula calculation result.
     */
    v?: ICellData['v'];

    /**
     * Formula calculation format.
     */
    t?: ICellData['t'];
}

export interface IDocFormulaReference extends IDocFormulaData {
    unitId: string;

    /** Formula id assigned by the formula engine. It should not be written to snapshot. */
    formulaId: string;
}

export interface IDocFormulaCache extends Pick<ICellData, 'v' | 't'> { }

export function toJson(formulas: IDocFormulaReference[]): string {
    return JSON.stringify(formulas.map((f) => ({ rangeId: f.rangeId, f: f.f, v: f.v, t: f.t })));
}
