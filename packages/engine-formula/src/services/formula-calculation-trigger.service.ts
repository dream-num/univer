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

import type { ICommandInfo, IUnitRange, Nullable } from '@univerjs/core';
import type { IDirtyUnitFeatureMap } from '../basics/common';
import type { ISetFormulaCalculationNotificationMutation } from '../commands/mutations/set-formula-calculation.mutation';
import type { IFormulaDirtyData } from './current-data.service';
import { Disposable, ICommandService, Rectangle } from '@univerjs/core';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '../commands/mutations/set-formula-calculation.mutation';
import { IActiveDirtyManagerService } from './active-dirty-manager.service';
import { FormulaExecutedStateType } from './runtime.service';

const LOCAL_ONLY = { onlyLocal: true };
const CALCULATION_DEBOUNCE_TIME = 10;

type IDirtyUnitStringMap = Record<string, Nullable<Record<string, string>>>;

/**
 * Converts commands registered in ActiveDirtyManagerService into one formula
 * calculation stream. Product packages register dirty conversions, while this
 * service owns batching and restart semantics for every unit type.
 */
export class FormulaCalculationTriggerService extends Disposable {
    private _waitingCommandQueue: ICommandInfo[] = [];
    private _pendingDirtyData = createEmptyDirtyData();
    private _runningDirtyData = createEmptyDirtyData();
    private _timer: ReturnType<typeof setTimeout> | undefined;
    private _started = false;
    private _executionInProgress = false;
    private _hasPendingCalculation = false;
    private _stopRequested = false;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService
    ) {
        super();
        this._initialize();
    }

    start(): void {
        if (this._started) {
            return;
        }

        this._started = true;
        this._scheduleFlush();
    }

    override dispose(): void {
        clearTimeout(this._timer);
        this._waitingCommandQueue = [];
        this._pendingDirtyData = createEmptyDirtyData();
        this._runningDirtyData = createEmptyDirtyData();
        super.dispose();
    }

    private _initialize(): void {
        this.disposeWithMe(this._commandService.onCommandExecuted((command, options) => {
            if (command.id === SetFormulaCalculationStartMutation.id) {
                this._executionInProgress = true;
                return;
            }

            if (command.id === SetFormulaCalculationNotificationMutation.id) {
                this._handleCalculationNotification(command.params as ISetFormulaCalculationNotificationMutation);
                return;
            }

            const conversion = this._activeDirtyManagerService.get(command.id);
            if (!conversion) {
                return;
            }
            if (conversion.shouldTrigger?.(command, options) === false) {
                return;
            }

            this._waitingCommandQueue.push(command);
            this._scheduleFlush();
        }));
    }

    private _scheduleFlush(): void {
        if (!this._started || (this._waitingCommandQueue.length === 0 && !this._hasPendingCalculation)) {
            return;
        }

        clearTimeout(this._timer);
        this._timer = setTimeout(() => this._flush(), CALCULATION_DEBOUNCE_TIME);
    }

    private _flush(): void {
        const commands = this._waitingCommandQueue;
        const dirtyData = this._generateDirty(commands);
        this._waitingCommandQueue = [];
        this._timer = undefined;
        if (hasDirtyData(dirtyData) || commands.some(({ id }) => id === SetTriggerFormulaCalculationStartMutation.id)) {
            this._pendingDirtyData = mergeDirtyData(this._pendingDirtyData, dirtyData);
            this._hasPendingCalculation = true;
        }

        if (!this._hasPendingCalculation) {
            return;
        }

        if (this._executionInProgress) {
            if (!this._stopRequested && dirtyDataIntersects(this._runningDirtyData, this._pendingDirtyData)) {
                this._stopRequested = true;
                this._commandService.executeCommand(SetFormulaCalculationStopMutation.id, {}, LOCAL_ONLY);
            }
            return;
        }

        this._startCalculation();
    }

    private _startCalculation(): void {
        this._runningDirtyData = this._pendingDirtyData;
        this._pendingDirtyData = createEmptyDirtyData();
        this._hasPendingCalculation = false;
        this._executionInProgress = true;
        this._stopRequested = false;
        this._commandService.executeCommand(
            SetFormulaCalculationStartMutation.id,
            { ...this._runningDirtyData },
            LOCAL_ONLY
        );
    }

    private _handleCalculationNotification(params: ISetFormulaCalculationNotificationMutation): void {
        if (params.stageInfo != null) {
            this._executionInProgress = true;
            return;
        }

        const state = params.functionsExecutedState;
        if (state == null) {
            return;
        }

        const calculationCompleted = state === FormulaExecutedStateType.STOP_EXECUTION ||
            state === FormulaExecutedStateType.SUCCESS ||
            state === FormulaExecutedStateType.NOT_EXECUTED;
        if (!calculationCompleted || !this._executionInProgress) {
            return;
        }

        this._executionInProgress = false;
        this._stopRequested = false;
        if (state === FormulaExecutedStateType.STOP_EXECUTION) {
            this._pendingDirtyData = mergeDirtyData(this._runningDirtyData, this._pendingDirtyData);
        }
        this._runningDirtyData = createEmptyDirtyData();

        if (this._hasPendingCalculation || this._waitingCommandQueue.length > 0) {
            this._scheduleFlush();
        }
    }

    private _generateDirty(commands: ICommandInfo[]): IFormulaDirtyData {
        return commands.reduce<IFormulaDirtyData>((result, command) => {
            const conversion = this._activeDirtyManagerService.get(command.id);
            return conversion ? mergeDirtyData(result, conversion.getDirtyData(command)) : result;
        }, createEmptyDirtyData());
    }
}

function createEmptyDirtyData(): IFormulaDirtyData {
    return {
        forceCalculation: false,
        dirtyRanges: [],
        dirtyNameMap: {},
        dirtyDefinedNameMap: {},
        dirtySuperTableMap: {},
        dirtyUnitFeatureMap: {},
        dirtyUnitOtherFormulaMap: {},
        clearDependencyTreeCache: {},
    };
}

function mergeDirtyData(left: IFormulaDirtyData, right: Partial<IFormulaDirtyData>): IFormulaDirtyData {
    const dirtyRanges = [...left.dirtyRanges];
    mergeDirtyRanges(dirtyRanges, right.dirtyRanges ?? []);
    return {
        dirtyRanges,
        dirtyNameMap: mergeDirtyUnitStringMap(left.dirtyNameMap, right.dirtyNameMap),
        dirtyDefinedNameMap: mergeDirtyUnitStringMap(left.dirtyDefinedNameMap, right.dirtyDefinedNameMap),
        dirtySuperTableMap: mergeDirtyUnitStringMap(left.dirtySuperTableMap ?? {}, right.dirtySuperTableMap),
        dirtyUnitFeatureMap: mergeDirtyUnitNestedMap(left.dirtyUnitFeatureMap, right.dirtyUnitFeatureMap),
        dirtyUnitOtherFormulaMap: mergeDirtyUnitNestedMap(left.dirtyUnitOtherFormulaMap, right.dirtyUnitOtherFormulaMap),
        clearDependencyTreeCache: mergeDirtyUnitStringMap(left.clearDependencyTreeCache, right.clearDependencyTreeCache),
        forceCalculation: left.forceCalculation || Boolean(right.forceCalculation),
    };
}

function mergeDirtyRanges(target: IUnitRange[], source: IUnitRange[]): void {
    const keys = new Set(target.map(getDirtyRangeKey));
    source.forEach((range) => {
        const key = getDirtyRangeKey(range);
        if (!keys.has(key)) {
            keys.add(key);
            target.push(range);
        }
    });
}

function getDirtyRangeKey({ unitId, sheetId, range }: IUnitRange): string {
    return JSON.stringify([unitId, sheetId, range.startRow, range.startColumn, range.endRow, range.endColumn, range.rangeType]);
}

function mergeDirtyUnitStringMap(left: IDirtyUnitStringMap, right?: IDirtyUnitStringMap): IDirtyUnitStringMap {
    const result: IDirtyUnitStringMap = { ...left };
    Object.entries(right ?? {}).forEach(([unitId, values]) => {
        result[unitId] = { ...result[unitId], ...values };
    });
    return result;
}

function mergeDirtyUnitNestedMap(left: IDirtyUnitFeatureMap, right?: IDirtyUnitFeatureMap): IDirtyUnitFeatureMap {
    const result: IDirtyUnitFeatureMap = { ...left };
    Object.entries(right ?? {}).forEach(([unitId, sheets]) => {
        const unitResult: NonNullable<IDirtyUnitFeatureMap[string]> = { ...result[unitId] };
        Object.entries(sheets ?? {}).forEach(([sheetId, values]) => {
            unitResult[sheetId] = { ...unitResult[sheetId], ...values };
        });
        result[unitId] = unitResult;
    });
    return result;
}

function hasDirtyData(dirtyData: IFormulaDirtyData): boolean {
    return dirtyData.forceCalculation ||
        dirtyData.dirtyRanges.length > 0 ||
        hasNestedValue(dirtyData.dirtyNameMap) ||
        hasNestedValue(dirtyData.dirtyDefinedNameMap) ||
        hasNestedValue(dirtyData.dirtySuperTableMap) ||
        hasNestedValue(dirtyData.dirtyUnitFeatureMap) ||
        hasNestedValue(dirtyData.dirtyUnitOtherFormulaMap) ||
        hasNestedValue(dirtyData.clearDependencyTreeCache);
}

function hasNestedValue(value: unknown): boolean {
    if (value == null) {
        return false;
    }
    if (typeof value !== 'object') {
        return true;
    }
    return Object.values(value as Record<string, unknown>).some(hasNestedValue);
}

function dirtyDataIntersects(left: IFormulaDirtyData, right: IFormulaDirtyData): boolean {
    if (left.forceCalculation || right.forceCalculation) {
        return true;
    }

    const rangesIntersect = left.dirtyRanges.some((leftRange) => right.dirtyRanges.some((rightRange) =>
        leftRange.unitId === rightRange.unitId &&
        leftRange.sheetId === rightRange.sheetId &&
        Rectangle.intersects(leftRange.range, rightRange.range)
    ));
    if (rangesIntersect || clearedSheetIntersects(left, right) || clearedSheetIntersects(right, left)) {
        return true;
    }

    return [
        [left.dirtyNameMap, right.dirtyNameMap],
        [left.dirtyDefinedNameMap, right.dirtyDefinedNameMap],
        [left.dirtySuperTableMap, right.dirtySuperTableMap],
        [left.dirtyUnitFeatureMap, right.dirtyUnitFeatureMap],
        [left.dirtyUnitOtherFormulaMap, right.dirtyUnitOtherFormulaMap],
        [left.clearDependencyTreeCache, right.clearDependencyTreeCache],
    ].some(([leftMap, rightMap]) => hasSameNestedKey(leftMap, rightMap));
}

function clearedSheetIntersects(cleared: IFormulaDirtyData, dirty: IFormulaDirtyData): boolean {
    return Object.entries(cleared.clearDependencyTreeCache).some(([unitId, sheets]) =>
        Object.keys(sheets ?? {}).some((sheetId) =>
            dirty.dirtyRanges.some((range) => range.unitId === unitId && range.sheetId === sheetId) ||
            dirty.dirtyNameMap[unitId]?.[sheetId] != null ||
            dirty.dirtyUnitFeatureMap[unitId]?.[sheetId] != null ||
            dirty.dirtyUnitOtherFormulaMap[unitId]?.[sheetId] != null
        )
    );
}

function hasSameNestedKey(left: unknown, right: unknown): boolean {
    if (left == null || right == null || typeof left !== 'object' || typeof right !== 'object') {
        return left != null && right != null;
    }

    const rightRecord = right as Record<string, unknown>;
    return Object.entries(left as Record<string, unknown>).some(([key, value]) =>
        Object.prototype.hasOwnProperty.call(rightRecord, key) && hasSameNestedKey(value, rightRecord[key])
    );
}
