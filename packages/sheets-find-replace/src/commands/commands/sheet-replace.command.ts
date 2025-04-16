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

import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import type { IAccessor, ICellData, ICommand, IObjectArrayPrimitiveType } from '@univerjs/core';
import type { IReplaceAllResult } from '@univerjs/find-replace';
import { type ISetRangeValuesCommandParams, SetRangeValuesCommand } from '@univerjs/sheets';

export interface ISheetReplaceCommandParams {
    unitId: string;
    replacements: ISheetReplacement[];
}

export interface ISheetReplacement {
    count: number;
    subUnitId: string;
    value: IObjectArrayPrimitiveType<ICellData>;
}

/**
 * This command is used for the SheetFindReplaceController to deal with replacing, including undo redo.
 *
 */
export const SheetReplaceCommand: ICommand<ISheetReplaceCommandParams, IReplaceAllResult> = {
    id: 'sheet.command.replace',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISheetReplaceCommandParams) => {
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);

        const { unitId, replacements } = params;

        // NOTE: Note that if we are going to support "Replace All" in different units, this need to be changed.
        const disposeBatchingHandler = undoRedoService.__tempBatchingUndoRedo(unitId);
        const results = await Promise.all(replacements.map((replacement) => commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId,
            subUnitId: replacement.subUnitId,
            value: replacement.value,
        } as ISetRangeValuesCommandParams)));
        disposeBatchingHandler.dispose();

        return getReplaceAllResult(results, replacements);
    },
};

function getReplaceAllResult(results: boolean[], replacements: ISheetReplacement[]): IReplaceAllResult {
    let success = 0;
    let failure = 0;

    results.forEach((r, index) => {
        const count = replacements[index].count;
        if (r) {
            success += count;
        } else {
            failure += count;
        }
    });

    return { success, failure };
}
