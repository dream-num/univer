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

import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { IUniFormulaService } from '../../services/uni-formula.service';

export interface IAddSlideUniFormulaMutationParams {
    unitId: string;
    pageId: string;
    elementId: string;
    rangeId: string;

    f: string;
}

export const AddSlideUniFormulaMutation: IMutation<IAddSlideUniFormulaMutationParams> = {
    type: CommandType.MUTATION,
    id: 'slide.mutation.add-slide-uni-formula',
    handler(accessor, params: IAddSlideUniFormulaMutationParams) {
        const { unitId, pageId, elementId, f, rangeId: id } = params;
        const uniFormulaService = accessor.get(IUniFormulaService);

        uniFormulaService.registerSlideFormula(unitId, pageId, elementId, id, f);

        return true;
    },
};

export interface IUpdateSlideUniFormulaMutationParams extends IAddSlideUniFormulaMutationParams {}

export const UpdateSlideUniFormulaMutation: IMutation<IUpdateSlideUniFormulaMutationParams> = {
    type: CommandType.MUTATION,
    id: 'slide.mutation.update-slide-uni-formula',
    handler(accessor, params: IUpdateSlideUniFormulaMutationParams) {
        const { unitId, pageId, elementId, f, rangeId: id } = params;
        const uniFormulaService = accessor.get(IUniFormulaService);

        if (!uniFormulaService.hasSlideFormula(unitId, pageId, elementId, id)) return false;

        uniFormulaService.unregisterSlideFormula(unitId, pageId, elementId, id);
        uniFormulaService.registerSlideFormula(unitId, pageId, elementId, id, f);
        return true;
    },
};
