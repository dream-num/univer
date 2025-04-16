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

import type { IAccessor, ICommand, IRange } from '@univerjs/core';

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import {
    getSheetCommandTarget,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { AutoWidthController } from '../../controllers/auto-width.controller';

export interface ISetWorksheetColIsAutoWidthCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[]; // For Facade API
}

export const SetWorksheetColAutoWidthCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-auto-width',
    handler: (accessor: IAccessor, params?: ISetWorksheetColIsAutoWidthCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;

        let ranges = [];
        if (params?.ranges) {
            ranges = [...params.ranges];
        } else {
            const selections = selectionManagerService.getCurrentSelections();
            for (let i = 0; i < selections.length; i++) {
                ranges.push(selections[i].range);
            }
        }

        if (!ranges?.length) {
            return false;
        }

        const redoMutationParams: Required<ISetWorksheetColIsAutoWidthCommandParams> = {
            unitId,
            subUnitId,
            ranges,
        };

        // undos redos comes from auto-width.controller
        const { redos, undos } = accessor.get(AutoWidthController).getUndoRedoParamsOfColWidth(redoMutationParams);

        const result = sequenceExecute([...redos], commandService);
        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [...undos],
                redoMutations: [...redos],
            });

            return true;
        }

        return false;
    },
};
