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

import type { IAccessor, ICommand, IObjectArrayPrimitiveType, IRowData, Nullable } from '@univerjs/core';
import type { ISetRowDataMutationParams } from '../mutations/set-row-data.mutation';

import type { ISheetCommandSharedParams } from '../utils/interface';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { SetRowDataMutation, SetRowDataMutationFactory } from '../mutations/set-row-data.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export type IRowProperties = Omit<IRowData, 'h' | 'ia' | 'ah' | 'hd'>;

export interface ISetRowDataCommandParams extends Partial<ISheetCommandSharedParams> {
    rowData: IObjectArrayPrimitiveType<Nullable<IRowProperties>>;
}

export const SetRowDataCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-data',
    handler: (accessor: IAccessor, params: ISetRowDataCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { rowData } = params;
        const { unitId, subUnitId, worksheet } = target;

        const redoMutationParams: ISetRowDataMutationParams = {
            subUnitId,
            unitId,
            rowData,
        };

        const undoMutationParams = SetRowDataMutationFactory(redoMutationParams, worksheet);

        const result = commandService.syncExecuteCommand(SetRowDataMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetRowDataMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetRowDataMutation.id, params: redoMutationParams }],
            });

            return true;
        }

        return false;
    },
};
