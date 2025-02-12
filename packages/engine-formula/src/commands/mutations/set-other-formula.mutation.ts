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
import type { IOtherFormulaDataItem } from '../../basics/common';

import { CommandType } from '@univerjs/core';

export interface ISetOtherFormulaMutationParams {
    unitId: string;
    subUnitId: string;
    formulaMap: Record<string, IOtherFormulaDataItem>;
};
export interface IRemoveOtherFormulaMutationParams {
    unitId: string;
    subUnitId: string;
    formulaIdList: string[];
};

// TODO: remove these two mutations to use RPC instead.

/**
 * In the formula engine, the mutation is solely responsible for communication between the worker and the main thread.
 * It requires setting local to true during execution.
 */
export const SetOtherFormulaMutation: IMutation<ISetOtherFormulaMutationParams> = {
    id: 'formula.mutation.set-other-formula',
    type: CommandType.MUTATION,
    handler: () => true,
};

export const RemoveOtherFormulaMutation: IMutation<IRemoveOtherFormulaMutationParams> = {
    id: 'formula.mutation.remove-other-formula',
    type: CommandType.MUTATION,
    handler: () => true,
};
