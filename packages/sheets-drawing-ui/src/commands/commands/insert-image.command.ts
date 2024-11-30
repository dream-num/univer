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

import type { ICommand, Nullable } from '@univerjs/core';
import { CommandType, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetDrawingUpdateController } from '../../controllers/sheet-drawing-update.controller';

export interface IInsertImageCommandParams {
    files: Nullable<File[]>;
};

export const InsertFloatImageCommand: ICommand<IInsertImageCommandParams> = {
    id: 'sheet.command.insert-float-image',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const renderManagerService = accessor.get(IRenderManagerService);
        return renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET)
            ?.with(SheetDrawingUpdateController)
            .insertFloatImage() ?? false;
    },
};

export const InsertCellImageCommand: ICommand = {
    id: 'sheet.command.insert-cell-image',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const renderManagerService = accessor.get(IRenderManagerService);
        return renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET)
            ?.with(SheetDrawingUpdateController)
            .insertCellImage() ?? false;
    },
};
