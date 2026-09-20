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

import type { IAccessor, ICommand, IWorksheetBackgroundImage, Nullable } from '@univerjs/core';
import type { ISetWorksheetBackgroundImageMutationParams } from '../mutations/set-worksheet-background-image.mutation';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { SetWorksheetBackgroundImageMutation } from '../mutations/set-worksheet-background-image.mutation';

export interface ISetWorksheetBackgroundImageCommandParams {
    unitId?: string;
    subUnitId?: string;
    backgroundImage: Nullable<IWorksheetBackgroundImage>;
}

export const SetWorksheetBackgroundImageCommand: ICommand<ISetWorksheetBackgroundImageCommandParams> = {
    id: 'sheet.command.set-worksheet-background-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) {
            return false;
        }

        const { unitId, subUnitId, worksheet } = target;
        const previous = worksheet.getConfig().backgroundImage;
        const next = params.backgroundImage;
        if (previous?.source === next?.source && previous?.imageSourceType === next?.imageSourceType) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const redoParams: ISetWorksheetBackgroundImageMutationParams = {
            unitId,
            subUnitId,
            backgroundImage: next ? { ...next } : null,
        };
        const undoParams: ISetWorksheetBackgroundImageMutationParams = {
            unitId,
            subUnitId,
            backgroundImage: previous ? { ...previous } : null,
        };

        const result = commandService.syncExecuteCommand(SetWorksheetBackgroundImageMutation.id, redoParams);
        if (!result) {
            return false;
        }

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations: [{ id: SetWorksheetBackgroundImageMutation.id, params: undoParams }],
            redoMutations: [{ id: SetWorksheetBackgroundImageMutation.id, params: redoParams }],
        });

        return true;
    },
};
