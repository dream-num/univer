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
import type { ISelectionWithStyle } from '../../basics/selection';
import type { SelectionMoveType } from '../../services/selections/type';
import { CommandType } from '@univerjs/core';
import { getSelectionsService } from '../utils/selection-command-util';

export interface ISetSelectionsOperationParams {
    unitId: string;
    subUnitId: string;
    selections: ISelectionWithStyle[];
    type?: SelectionMoveType;

    /** If should scroll to the selected range. */
    reveal?: boolean;
    extra?: string;
}

/**
 * Set selections to SelectionModel(WorkbookSelectionModel) by selectionManagerService.
 */
export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params) return false;
        const { selections, type, unitId, subUnitId } = params;
        const selectionManagerService = getSelectionsService(accessor);

        // Must update selections array ref.
        // See https://github.com/dream-num/univer/issues/2199
        selectionManagerService.setSelections(unitId, subUnitId, [...selections], type);
        return true;
    },
};
