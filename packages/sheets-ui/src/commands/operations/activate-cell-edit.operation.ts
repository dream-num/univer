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

import type { IOperation } from '@univerjs/core';
import type { ICurrentEditCellParam } from '../../services/editor-bridge.service';

import { CommandType } from '@univerjs/core';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

export const SetActivateCellEditOperation: IOperation<ICurrentEditCellParam> = {
    id: 'sheet.operation.set-activate-cell-edit',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const editorBridgeService = accessor.get(IEditorBridgeService);
        editorBridgeService.setEditCell(params);
        return true;
    },
};
