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

import type { IAccessor, IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';

import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { getSheetMutationTarget } from '../commands/utils/target-util';

/**
 * Generate undo mutation of a `RemoveSheetMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IRemoveSheetMutationParams} params - do mutation params
 * @returns {IInsertSheetMutationParams} undo mutation params
 */
export const RemoveSheetUndoMutationFactory = (
    accessor: IAccessor,
    params: IRemoveSheetMutationParams
): IInsertSheetMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const { subUnitId, unitId } = params;

    const target = getSheetMutationTarget(univerInstanceService, params);
    if (!target) {
        throw new Error('[RemoveSheetUndoMutationFactory]: Worksheet is null error!');
    }

    const { workbook, worksheet } = target;
    const sheet = worksheet.getConfig();
    const config = workbook.getConfig();
    const index = config.sheetOrder.findIndex((id) => id === subUnitId);

    return {
        index,
        sheet,
        unitId,
    };
};

export const RemoveSheetMutation: IMutation<IRemoveSheetMutationParams, boolean> = {
    id: 'sheet.mutation.remove-sheet',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { subUnitId, unitId } = params;
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            return false;
        }

        return workbook.removeSheet(subUnitId);
    },
};
