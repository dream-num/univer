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

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { ISelectionWithStyle } from '../../basics/selection';
import type { SelectionMoveType } from '../../services/selection-manager.service';
import { SelectionManagerService } from '../../services/selection-manager.service';

export interface ISetSelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
    type?: SelectionMoveType;
}
export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);

        if (!params) {
            return false;
        }

        const { selections, type } = params;

        // TODO@yuhongz: incorrect coupling
        // if (params.pluginName === FORMAT_PAINTER_SELECTION_PLUGIN_NAME) {
        //     selections.length > 1 && selections.splice(1, selections.length - 2);
        // }

        selectionManagerService.replace(selections, type);

        return true;
    },
};
