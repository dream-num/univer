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

import type { IAccessor, IColumnData, ICommand, IObjectArrayPrimitiveType, Nullable } from '@univerjs/core';
import type { ISetColDataMutationParams } from '../mutations/set-col-data.mutation';

import type { ISheetCommandSharedParams } from '../utils/interface';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { SetColDataMutation, SetColDataMutationFactory } from '../mutations/set-col-data.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export type IColumnProperties = Omit<IColumnData, 'w' | 'hd'>;

export interface ISetColDataCommandParams extends Partial<ISheetCommandSharedParams> {
    columnData: IObjectArrayPrimitiveType<Nullable<IColumnProperties>>;
}

export const SetColDataCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-data',
    handler: (accessor: IAccessor, params: ISetColDataCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { columnData } = params;
        const { unitId, subUnitId, worksheet } = target;

        const redoMutationParams: ISetColDataMutationParams = {
            subUnitId,
            unitId,
            columnData,
        };

        const undoMutationParams = SetColDataMutationFactory(redoMutationParams, worksheet);

        const result = commandService.syncExecuteCommand(SetColDataMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetColDataMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetColDataMutation.id, params: redoMutationParams }],
            });

            return true;
        }

        return false;
    },
};
