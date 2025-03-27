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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { IToggleGridlinesMutationParams } from '../mutations/toggle-gridlines.mutation';
import { BooleanNumber, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { ToggleGridlinesMutation } from '../mutations/toggle-gridlines.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface IToggleGridlinesCommandParams {
    showGridlines?: BooleanNumber;
    unitId?: string;
    subUnitId?: string;
}

export const ToggleGridlinesCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.toggle-gridlines',
    handler: (accessor: IAccessor, params?: IToggleGridlinesCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const currentlyShow = worksheet.getConfig().showGridlines;
        if (currentlyShow === params?.showGridlines) return false;

        const { unitId, subUnitId } = target;
        const doParams: IToggleGridlinesMutationParams = {
            showGridlines: currentlyShow === BooleanNumber.TRUE ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            unitId,
            subUnitId,
        };

        const undoMutationParams: IToggleGridlinesMutationParams = {
            showGridlines: currentlyShow,
            unitId,
            subUnitId,
        };

        const result = commandService.syncExecuteCommand(ToggleGridlinesMutation.id, doParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: ToggleGridlinesMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: ToggleGridlinesMutation.id, params: doParams }],
            });

            return true;
        }

        return false;
    },
};
