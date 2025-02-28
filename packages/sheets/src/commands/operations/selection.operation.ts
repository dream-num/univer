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

import type { IAccessor, ICommand, IOperation, IRange } from '@univerjs/core';
import type { ISelectionWithStyle } from '../../basics/selection';
import type { SelectionMoveType } from '../../services/selections/type';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getPrimaryForRange } from '../commands/utils/selection-utils';
import { getSheetCommandTarget } from '../commands/utils/target-util';
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

export interface ISelectRangeCommandParams {
    unitId: string;
    subUnit: string;
    range: IRange;

    /** If should scroll to the selected range. */
    reveal?: boolean;
    extra?: string;
}

export const SelectRangeCommand: ICommand<ISelectRangeCommandParams> = {
    id: 'sheet.command.select-range',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: ISelectRangeCommandParams) => {
        if (!params) return false;

        const { unitId, subUnit, range } = params;
        const commandService = accessor.get(ICommandService);
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const selections: ISelectionWithStyle[] = [{
            range,
            primary: getPrimaryForRange(range, target.worksheet),
            style: null,
        }];

        return commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: subUnit,
            selections,
        } as ISetSelectionsOperationParams);
    },
};
