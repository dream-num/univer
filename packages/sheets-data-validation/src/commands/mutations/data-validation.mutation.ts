/**
 * Copyright 2023-present DreamNum Inc.
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

import { CommandType, type ICommand, type ObjectMatrix } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import type { SheetDataValidationManager } from '../../models/sheet-data-validation-manager';

export interface IUpdateDataValidationRangeByMatrixMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: ObjectMatrix<string>;

}

export const UpdateDataValidationRangeByMatrixMutation: ICommand<IUpdateDataValidationRangeByMatrixMutationParams> = {
    id: 'sheets.mutation.updateDataValidationRangeByMatrix',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ranges } = params;

        const dataValidationModel = accessor.get(DataValidationModel);
        const manager = dataValidationModel.getOrCreateManager(unitId, subUnitId) as SheetDataValidationManager;

        manager.updateRangesByMatrix(ranges);
        return true;
    },

};
