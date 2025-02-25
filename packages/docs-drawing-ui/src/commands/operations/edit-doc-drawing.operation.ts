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

import type { IAccessor, IDrawingSearch, IOperation } from '@univerjs/core';
import {
    CommandType,
    ICommandService,

} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SidebarDocDrawingOperation } from './open-drawing-panel.operation';

// Use to open drawing edit panel.
export const EditDocDrawingOperation: IOperation<IDrawingSearch> = {
    id: 'doc.operation.edit-doc-image',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params?: IDrawingSearch) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);
        const commandService = accessor.get(ICommandService);

        if (params == null) {
            return false;
        }
        drawingManagerService.focusDrawing([params]);
        commandService.executeCommand(SidebarDocDrawingOperation.id, { value: 'open' });
        return true;
    },
};
