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

import type { ICommandInfo, IRange } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, Rectangle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IMoveRowsMutationParams } from '../commands/mutations/move-rows-cols.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../commands/mutations/move-rows-cols.mutation';

const mutationIdArrByMove = [MoveRowsMutation.id, MoveColsMutation.id];

type IMoveRowsOrColsMutationParams = IMoveRowsMutationParams;

@OnLifecycle(LifecycleStages.Steady, MoveRowsColsController)
export class MoveRowsColsController extends Disposable {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (mutationIdArrByMove.includes(command.id)) {
                const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                const worksheet = workbook.getActiveSheet();
                if (!command.params) return;

                const { sourceRange, targetRange } = command.params as IMoveRowsOrColsMutationParams;
                const isRowMove = sourceRange.startColumn === targetRange.startColumn && sourceRange.endColumn === targetRange.endColumn;
                const moveLength = isRowMove
                    ? sourceRange.endRow - sourceRange.startRow + 1
                    : sourceRange.endColumn - sourceRange.startColumn + 1;
                const sourceStart = isRowMove ? sourceRange.startRow : sourceRange.startColumn;
                const targetStart = isRowMove ? targetRange.startRow : targetRange.startColumn;
                const mergeData = worksheet.getConfig().mergeData;

                const adjustedMergedCells: IRange[] = [];
                mergeData.forEach((merge) => {
                    let { startRow, endRow, startColumn, endColumn, rangeType } = merge;

                    if (!Rectangle.intersects(merge, sourceRange)) {
                        if (isRowMove) {
                            if (sourceStart < startRow && targetStart > endRow) {
                                startRow -= moveLength;
                                endRow -= moveLength;
                            } else if (sourceStart > endRow && targetStart <= startRow) {
                                startRow += moveLength;
                                endRow += moveLength;
                            }
                        } else {
                            if (sourceStart < startColumn && targetStart > endColumn) {
                                startColumn -= moveLength;
                                endColumn -= moveLength;
                            } else if (sourceStart > endColumn && targetStart <= startColumn) {
                                startColumn += moveLength;
                                endColumn += moveLength;
                            }
                        }
                    }

                    if (!(merge.startRow === merge.endRow && merge.startColumn === merge.endColumn)) {
                        adjustedMergedCells.push({ startRow, endRow, startColumn, endColumn, rangeType });
                    }
                });
                worksheet.getConfig().mergeData = adjustedMergedCells;
            }
        }));
    }
}
