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
import type { IInsertRowCommandParams } from '../commands/commands/insert-row-col.command';
import { InsertColMutation, InsertRowMutation } from '../commands/mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../commands/mutations/remove-row-col.mutation';

const mutationIdByRowCol = [InsertColMutation.id, InsertRowMutation.id, RemoveColMutation.id, RemoveRowMutation.id];

@OnLifecycle(LifecycleStages.Steady, InsertOrRemoveRowColController)
export class InsertOrRemoveRowColController extends Disposable {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (mutationIdByRowCol.includes(command.id)) {
                const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                const worksheet = workbook.getActiveSheet();

                const mergeData = worksheet.getConfig().mergeData;
                const params = command.params as IInsertRowCommandParams;
                if (!params) return;
                const { range } = params;

                const isRowOperation = command.id.includes('row');
                const isAddOperation = command.id.includes('insert');

                const operationStart = isRowOperation ? range.startRow : range.startColumn;
                const operationEnd = isRowOperation ? range.endRow : range.endColumn;
                const operationCount = operationEnd - operationStart + 1;
                const adjustedMergedCells: IRange[] = [];

                mergeData.forEach((merge) => {
                    let { startRow, endRow, startColumn, endColumn, rangeType } = merge;

                    if (!Rectangle.intersects(merge, range)) {
                        if (isAddOperation) {
                            if (isRowOperation) {
                                if (operationStart <= startRow) {
                                    startRow += operationCount;
                                    endRow += operationCount;
                                }
                            } else {
                                if (operationStart <= startColumn) {
                                    startColumn += operationCount;
                                    endColumn += operationCount;
                                }
                            }
                        } else {
                            if (isRowOperation) {
                                if (operationEnd < startRow) {
                                    startRow -= operationCount;
                                    endRow -= operationCount;
                                }
                            } else {
                                if (operationEnd < startColumn) {
                                    startColumn -= operationCount;
                                    endColumn -= operationCount;
                                }
                            }
                        }

                        if (!(merge.startRow === merge.endRow && merge.startColumn === merge.endColumn)) {
                            adjustedMergedCells.push({ startRow, endRow, startColumn, endColumn, rangeType });
                        }
                    }
                });

                worksheet.getConfig().mergeData = adjustedMergedCells;
            }
        }));
    }
}
