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

import type { IOperation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { SheetsShowFormulasService } from '../../services/show-formulas.service';

export interface IToggleShowFormulasOperationParams {
    unitId?: string;
    subUnitId?: string;
    /** Force a state instead of toggling the current one. */
    enabled?: boolean;
}

/**
 * A {@link CommandType.OPERATION} to toggle whether a worksheet renders formula text
 * instead of computed values. Defaults to the active worksheet.
 */
export const ToggleShowFormulasOperation: IOperation<IToggleShowFormulasOperationParams> = {
    id: 'sheet.operation.toggle-show-formulas',
    type: CommandType.OPERATION,
    handler(accessor, params) {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) {
            return false;
        }

        const { unitId, subUnitId } = target;
        const service = accessor.get(SheetsShowFormulasService);
        const enabled = params?.enabled ?? !service.isEnabled(unitId, subUnitId);

        return service.setEnabled(unitId, subUnitId, enabled);
    },
};
