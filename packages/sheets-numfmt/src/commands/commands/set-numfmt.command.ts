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

import type { IAccessor, ICommand, IMutationInfo } from '@univerjs/core';
import type {
    FormatType,
    IRemoveNumfmtMutationParams,
    ISetCellsNumfmt,
    ISetNumfmtMutationParams,
} from '@univerjs/sheets';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import {
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    getSheetCommandTarget,
    rangeMerge,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    transformCellsToRange,
} from '@univerjs/sheets';

export interface ISetNumfmtCommandParams {
    unitId?: string;
    subUnitId?: string;
    values: Array<{ pattern?: string; row: number; col: number; type?: FormatType }>;
}

export const SetNumfmtCommand: ICommand<ISetNumfmtCommandParams> = {
    id: 'sheet.command.numfmt.set.numfmt',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const setCells = params.values.filter((value) => !!value.pattern) as ISetCellsNumfmt;
        const removeCells = params.values.filter((value) => !value.pattern);
        const setRedos = transformCellsToRange(unitId, subUnitId, setCells);
        const removeRedos: IRemoveNumfmtMutationParams = {
            unitId,
            subUnitId,
            ranges: removeCells.map((cell) => ({
                startColumn: cell.col,
                startRow: cell.row,
                endColumn: cell.col,
                endRow: cell.row,
            })),
        };
        const redos: Array<IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams>> = [];
        const undos: Array<IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams>> = [];
        if (setCells.length) {
            Object.keys(setRedos.values).forEach((key) => {
                const v = setRedos.values[key];
                v.ranges = rangeMerge(v.ranges);
            });
            redos.push({
                id: SetNumfmtMutation.id,
                params: setRedos,
            });
            const undo = factorySetNumfmtUndoMutation(accessor, setRedos);
            undos.push(...undo);
        }
        if (removeCells.length) {
            removeRedos.ranges = rangeMerge(removeRedos.ranges);
            redos.push({
                id: RemoveNumfmtMutation.id,
                params: removeRedos,
            });
            const undo = factoryRemoveNumfmtUndoMutation(accessor, removeRedos);
            undos.push(...undo);
        }

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }
        return result;
    },
};
