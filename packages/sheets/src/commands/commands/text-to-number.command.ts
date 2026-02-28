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

import type { IAccessor, ICellData, ICommand, IRange } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams } from '../mutations/numfmt-mutation';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import type { ISheetCommandSharedParams } from '../utils/interface';
import {
    CellValueType,
    CommandType,
    ICommandService,
    isRealNum,
    isTextFormat,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    sequenceExecute,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { factoryRemoveNumfmtUndoMutation, RemoveNumfmtMutation } from '../mutations/numfmt-mutation';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ITextToNumberCommandParams extends Partial<ISheetCommandSharedParams> {
    ranges?: IRange[];
}

/**
 * The command to convert text to number in selected cells.
 */
export const TextToNumberCommand: ICommand = {
    id: 'sheet.command.text-to-number',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor: IAccessor, params: ITextToNumberCommandParams) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const ranges = params?.ranges || accessor.get(SheetsSelectionsService).getCurrentSelections()?.map((s) => s.range);
        if (!ranges?.length) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { worksheet, unitId, subUnitId } = target;

        const newCellValue = new ObjectMatrix<ICellData>();
        const removeNumfmtRanges: IRange[] = [];

        for (let i = 0; i < ranges.length; i++) {
            for (let r = ranges[i].startRow; r <= ranges[i].endRow; r++) {
                for (let c = ranges[i].startColumn; c <= ranges[i].endColumn; c++) {
                    if (newCellValue.getValue(r, c)) {
                        continue;
                    }

                    const cell = worksheet.getCellRaw(r, c);
                    const pattern = typeof cell?.s === 'string' ? worksheet.getStyleDataByHash(cell.s)?.n?.pattern : cell?.s?.n?.pattern;

                    if (cell && cell.v && (cell.t !== CellValueType.NUMBER || isTextFormat(pattern)) && isRealNum(cell.v)) {
                        newCellValue.setValue(r, c, {
                            v: Number(cell.v),
                            t: CellValueType.NUMBER,
                        });

                        if (isTextFormat(pattern)) {
                            removeNumfmtRanges.push({
                                startRow: r,
                                endRow: r,
                                startColumn: c,
                                endColumn: c,
                            });
                        }
                    }
                }
            }
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: newCellValue.getMatrix(),
        };
        const redos = [
            {
                id: SetRangeValuesMutation.id,
                params: setRangeValuesMutationParams,
            },
        ];
        const undos = [
            {
                id: SetRangeValuesMutation.id,
                params: SetRangeValuesUndoMutationFactory(accessor, setRangeValuesMutationParams),
            },
        ];

        if (removeNumfmtRanges.length) {
            const removeNumfmtMutationParams: IRemoveNumfmtMutationParams = {
                unitId,
                subUnitId,
                ranges: removeNumfmtRanges,
            };
            redos.push({
                id: RemoveNumfmtMutation.id,
                params: removeNumfmtMutationParams,
            });
            undos.push(...factoryRemoveNumfmtUndoMutation(accessor, removeNumfmtMutationParams));
        }

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });

            return true;
        }

        return false;
    },
};
