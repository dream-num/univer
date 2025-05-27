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

import type { IRange, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ICancelMarkDirtyRowAutoHeightMutationParams, IMarkDirtyRowAutoHeightMutationParams } from '@univerjs/sheets';
import { createIdentifier, Disposable, ICommandService, Inject, Rectangle } from '@univerjs/core';
import { CancelMarkDirtyRowAutoHeightMutation, MarkDirtyRowAutoHeightMutation, SetWorksheetRowAutoHeightMutation } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IAutoHeightTask {
    ranges: IRange[];
    maxTime?: number;
    sheetId: string;
    id: string;
}

export interface IAutoHeightTaskInfo extends IAutoHeightTask {
    startTime: number;
    skeleton: SpreadsheetSkeleton;
}

export const IAutoHeightService = createIdentifier('sheets-ui.services.auto-height');

export function taskRowsFromRanges(ranges: IRange[], rows: number) {
    const result: IRange[] = [];
    const lasts: IRange[] = [...ranges];
    let needRows = rows;

    while (lasts.length > 0) {
        const range = lasts.shift();
        if (!range) {
            break;
        }

        const count = range.endRow - range.startRow + 1;
        if (count > needRows) {
            result.push({
                ...range,
                startRow: range.startRow,
                endRow: range.startRow + needRows - 1,
            });
            lasts.unshift({
                ...range,
                startRow: range.startRow + needRows,
            });
            break;
        } else {
            result.push(range);
            needRows -= count;
        }
    }

    return { result, lasts };
}

const CALCULATE_ROWS = 500;

export class AutoHeightService extends Disposable implements IRenderModule {
    private _autoHeightTasks: IAutoHeightTaskInfo[] = [];
    private _calculateLoopId: number | null = null;

    constructor(
        private _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initMarkDirty();
    }

    private _initMarkDirty() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((info) => {
                if (info.id === MarkDirtyRowAutoHeightMutation.id) {
                    const params = info.params as IMarkDirtyRowAutoHeightMutationParams;
                    const { unitId, subUnitId, ranges, id } = params;
                    if (unitId !== this._context.unitId) {
                        return;
                    }

                    this.startAutoHeightTask({
                        ranges,
                        sheetId: subUnitId,
                        id,
                        // 10s timeout
                        maxTime: 10_000,
                    });
                }

                if (info.id === CancelMarkDirtyRowAutoHeightMutation.id) {
                    const params = info.params as ICancelMarkDirtyRowAutoHeightMutationParams;
                    const { unitId, id } = params;
                    if (unitId !== this._context.unitId) {
                        return;
                    }
                    this.cancelTask(id);
                }
            })
        );
    }

    private _loopTask(task: IAutoHeightTaskInfo) {
        const skeleton = task.skeleton;
        let result: IRange[] = [];
        let lasts: IRange[] = [];
        if (task.maxTime && task.maxTime + task.startTime <= Date.now()) {
            result = task.ranges;
        } else {
            const info = taskRowsFromRanges(task.ranges, CALCULATE_ROWS);
            result = info.result;
            lasts = info.lasts;
        }

        const autoHeightInfos = skeleton.calculateAutoHeightInRange(result);
        const updatedRowsAutoHeightInfo = autoHeightInfos.filter((info) => {
            const { row, autoHeight } = info;
            if (!autoHeight) {
                return false;
            }
            const currentRowHeight = skeleton.getRowHeight(row);
            if (currentRowHeight === autoHeight) {
                return false;
            }
            return true;
        });

        if (lasts.length) {
            task.ranges = lasts;
            this._autoHeightTasks.unshift(task);
        }

        if (updatedRowsAutoHeightInfo.length) {
            const redoParams = {
                unitId: this._context.unitId,
                subUnitId: task.sheetId,
                rowsAutoHeightInfo: updatedRowsAutoHeightInfo,
            };
            this._commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, redoParams);
        }
    }

    private _calculateLoop(options: IdleDeadline) {
        while (this._autoHeightTasks.length) {
            if (options.timeRemaining() <= 0) {
                break;
            }
            const task = this._autoHeightTasks.shift();
            if (!task) {
                this._calculateLoopId = null;
                return;
            }
            this._loopTask(task);
        }

        this._calculateLoopId = requestIdleCallback((options) => {
            this._calculateLoop(options);
        });
    }

    private _initialCalculateLoop() {
        if (this._calculateLoopId === null) {
            this._calculateLoopId = requestIdleCallback((options) => {
                this._calculateLoop(options);
            });
        }
    }

    startAutoHeightTask(task: IAutoHeightTask): void {
        const skeleton = this._sheetSkeletonManagerService.getSkeleton(task.sheetId);
        if (!skeleton) {
            return;
        }

        task.ranges = Rectangle.mergeRanges(task.ranges.map((range) => {
            return {
                ...range,
                startColumn: 0,
                endColumn: 0,
            };
        }));

        const remainRanges = Rectangle.subtractMulti(
            task.ranges,
            this._autoHeightTasks
                .filter((newTask) => newTask.sheetId === task.sheetId)
                .map((task) => task.ranges)
                .flat()
        );

        if (remainRanges.length) {
            this._autoHeightTasks.push({
                ...task,
                startTime: Date.now(),
                skeleton,
                ranges: remainRanges,
            });

            this._initialCalculateLoop();
        }
    }

    cancelTask(taskId: string): void {
        const index = this._autoHeightTasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
            this._autoHeightTasks.splice(index, 1);
        }
    }
}
