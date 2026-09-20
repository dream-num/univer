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

import type { ICommand, Nullable } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import { SetWorksheetBackgroundImageCommand } from '@univerjs/sheets-drawing';
import { SheetDrawingUpdateController } from '../../controllers/sheet-drawing-update.controller';

export interface IAddWorksheetBackgroundImageCommandParams {
    files?: Nullable<File[]>;
}

export const AddWorksheetBackgroundImageCommand: ICommand<IAddWorksheetBackgroundImageCommandParams> = {
    id: 'sheet.command.add-worksheet-background-image',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);

        return getCurrentTypeOfRenderer(
            UniverInstanceType.UNIVER_SHEET,
            univerInstanceService,
            renderManagerService
        )
            ?.with(SheetDrawingUpdateController)
            .setWorksheetBackgroundImage(params?.files) ?? false;
    },
};

export const DeleteWorksheetBackgroundImageCommand: ICommand = {
    id: 'sheet.command.delete-worksheet-background-image',
    type: CommandType.COMMAND,
    handler: (accessor) => accessor.get(ICommandService).executeCommand(SetWorksheetBackgroundImageCommand.id, {
        backgroundImage: null,
    }),
};
