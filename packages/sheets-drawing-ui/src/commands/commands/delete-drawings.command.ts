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
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import type { IDeleteDrawingCommandParams } from './interfaces';
import { CommandType, ICommandService } from '@univerjs/core';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { RemoveSheetDrawingCommand } from './remove-sheet-drawing.command';

export const DeleteDrawingsCommand: ICommand = {
    id: 'sheet.command.delete-drawing',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const drawingManagerService = accessor.get(ISheetDrawingService);

        const drawings = drawingManagerService.getFocusDrawings();

        if (drawings.length === 0) {
            return false;
        }

        const unitId = drawings[0].unitId;

        const newDrawings = drawings.map((drawing) => {
            const { unitId, subUnitId, drawingId, drawingType } = drawing as ISheetDrawing;

            return {
                unitId,
                subUnitId,
                drawingId,
                drawingType,
            };
        });
        return commandService.executeCommand<IDeleteDrawingCommandParams>(RemoveSheetDrawingCommand.id, {
            unitId,
            drawings: newDrawings,
        });
    },
};
