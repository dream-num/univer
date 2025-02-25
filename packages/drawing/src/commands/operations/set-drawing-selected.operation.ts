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
} from '@univerjs/core';
import { IDrawingManagerService } from '../../services/drawing-manager.service';

export const SetDrawingSelectedOperation: IOperation<IDrawingSearch[]> = {
    id: 'drawing.operation.set-drawing-selected',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params?: IDrawingSearch[]) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);

        if (params == null) {
            return false;
        }
        drawingManagerService.focusDrawing(params);
        return true;
    },
};
