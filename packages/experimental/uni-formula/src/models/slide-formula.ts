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

export interface ISlideFormulaData {
    rangeId: string;

    f: string;

    v?: ICellData['v'];

    t?: ICellData['t'];
}

export interface ISlideFormulaReference extends ISlideFormulaData {
    unitId: string;

    pageId: string;

    elementId: string;

    formulaId: string;
}

export interface ISlideFormulaCache extends Pick<ICellData, 'v' | 't'> { }

export function slideToJson(formulas: ISlideFormulaReference[]): string {
    return JSON.stringify(formulas.map((f) => ({
        rangeId: f.rangeId,
        pageId: f.pageId,
        elementId: f.elementId,
        f: f.f,
        v: f.v,
        t: f.t,
    })));
}
