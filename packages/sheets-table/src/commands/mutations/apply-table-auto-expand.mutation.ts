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

import type { ICellData, IMutation, IMutationInfo, IRange, Workbook, Worksheet } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { CommandType, ICommandService, ILogService, IUniverInstanceService, ObjectMatrix, Tools } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import type { ITableAutoExpandPatch, ITableAutoExpandState } from '../../types/auto-expand';
import { TableManager } from '../../models/table-manager';

export interface IApplyTableAutoExpandMutationParams {
    unitId: string;
    subUnitId: string;
    patch: ITableAutoExpandPatch;
    direction: 'redo' | 'undo';
}

export const ApplyTableAutoExpandMutation: IMutation<IApplyTableAutoExpandMutationParams> = {
    id: 'sheet.mutation.auto-expand-table',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params || (params.direction !== 'redo' && params.direction !== 'undo')) {
            return false;
        }
        const { patch, direction } = params;
        if (!patch || typeof patch.operationId !== 'string' || !patch.operationId || typeof patch.showHeader !== 'boolean' || params.unitId !== patch.unitId || params.subUnitId !== patch.subUnitId
            || !validState(patch.before) || !validState(patch.after)
            || !Array.isArray(patch.redoEffects) || !Array.isArray(patch.undoEffects)
            || (patch.claimedRanges !== undefined && (!Array.isArray(patch.claimedRanges) || patch.claimedRanges.some((range) => !validRange(range))))) {
            return false;
        }
        const manager = accessor.get(TableManager);
        const table = manager.getTable(patch.unitId, patch.tableId);
        const worksheet = accessor.get(IUniverInstanceService).getUnit<Workbook>(patch.unitId)?.getSheetBySheetId(patch.subUnitId);
        const expected = direction === 'redo' ? patch.before : patch.after;
        const target = direction === 'redo' ? patch.after : patch.before;
        if (!table || table.getSubunitId() !== patch.subUnitId || !worksheet
            || target.range.endRow >= worksheet.getRowCount() || target.range.endColumn >= worksheet.getColumnCount()
            || patch.claimedRanges?.some((range) => range.endRow >= worksheet.getRowCount() || range.endColumn >= worksheet.getColumnCount())
            || !Tools.diffValue(table.getRange(), expected.range)
            || !Tools.diffValue(JSON.parse(JSON.stringify(table.getTableInfo().columns)), JSON.parse(JSON.stringify(expected.columns)))) {
            return false;
        }
        const commands = accessor.get(ICommandService);
        const effects = direction === 'redo' ? patch.redoEffects : patch.undoEffects;
        const inverses = direction === 'redo' ? patch.undoEffects : patch.redoEffects;
        const groups = splitEffects(patch);
        if (!groups) return false;
        const steps = direction === 'redo' ? groups : groups.reverse().map((group) => ({ effects: group.inverses, inverses: group.effects }));
        if ([...effects, ...inverses].some((effect) => !validEffect(effect, patch, commands))) {
            return false;
        }
        if (direction === 'redo' && !matchesFormulaTargets(steps, worksheet)) return false;
        const applied: typeof steps = [];
        try {
            if (direction === 'redo') {
                manager.setTableRangeAndColumns(patch.unitId, patch.tableId, Tools.deepClone(target));
            }
            for (const step of steps) {
                let recorded = false;
                for (const effect of step.effects) {
                    let success: boolean;
                    try {
                        success = commands.syncExecuteCommand(effect.id, Tools.deepClone(effect.params), { onlyLocal: true });
                    } catch (error) {
                        if (!recorded) applied.push(step);
                        throw error;
                    }
                    if (!success) throw new Error(`Table auto expansion effect failed: ${effect.id}`);
                    if (!recorded) {
                        applied.push(step);
                        recorded = true;
                    }
                }
            }
            if (direction === 'undo') {
                manager.setTableRangeAndColumns(patch.unitId, patch.tableId, Tools.deepClone(target));
            }
            return true;
        } catch (error) {
            const rollbackErrors: unknown[] = [];
            if (direction === 'undo') {
                try {
                    manager.setTableRangeAndColumns(patch.unitId, patch.tableId, Tools.deepClone(expected));
                } catch (rollbackError) {
                    rollbackErrors.push(rollbackError);
                }
            }
            for (const step of applied.reverse()) {
                for (const inverse of step.inverses) {
                    try {
                        executeEffects(commands, [inverse]);
                    } catch (rollbackError) {
                        rollbackErrors.push(rollbackError);
                    }
                }
            }
            if (direction === 'redo') {
                try {
                    manager.setTableRangeAndColumns(patch.unitId, patch.tableId, Tools.deepClone(expected));
                } catch (rollbackError) {
                    rollbackErrors.push(rollbackError);
                }
            }
            accessor.get(ILogService).error('[TableAutoExpand] Expansion cancelled', error, ...rollbackErrors);
            return false;
        }
    },
};

function splitEffects(patch: ITableAutoExpandPatch) {
    const counts = patch.effectGroups ?? [{ redoCount: patch.redoEffects.length, undoCount: patch.undoEffects.length }];
    if (!Array.isArray(counts)) return;
    const groups: Array<{ effects: IMutationInfo[]; inverses: IMutationInfo[] }> = [];
    let redoOffset = 0;
    let undoOffset = patch.undoEffects.length;
    for (const count of counts) {
        if (!count || typeof count !== 'object') return;
        const { redoCount, undoCount } = count;
        if (![redoCount, undoCount].every((count) => Number.isInteger(count) && count >= 0)) return;
        undoOffset -= undoCount;
        groups.push({ effects: patch.redoEffects.slice(redoOffset, redoOffset + redoCount), inverses: patch.undoEffects.slice(undoOffset, undoOffset + undoCount) });
        redoOffset += redoCount;
    }
    return redoOffset === patch.redoEffects.length && undoOffset === 0 ? groups : undefined;
}

function validRange(range: IRange | undefined): range is IRange {
    return !!range && [range.startRow, range.endRow, range.startColumn, range.endColumn].every((value) => Number.isInteger(value) && value >= 0)
        && range.startRow <= range.endRow && range.startColumn <= range.endColumn;
}

function validState(state: ITableAutoExpandState): boolean {
    const range = state?.range;
    if (!validRange(range) || !Array.isArray(state.columns) || state.columns.length !== range.endColumn - range.startColumn + 1) {
        return false;
    }
    const ids = new Set<string>();
    return state.columns.every((column) => {
        if (!column || typeof column.id !== 'string' || !column.id || ids.has(column.id) || typeof column.displayName !== 'string') {
            return false;
        }
        ids.add(column.id);
        return true;
    });
}

function validEffect(effect: IMutationInfo, patch: ITableAutoExpandPatch, commands: ICommandService): boolean {
    const params = effect?.params as { unitId?: string; subUnitId?: string } | undefined;
    return typeof effect?.id === 'string' && effect.id !== ApplyTableAutoExpandMutation.id
        && commands.getCommandType(effect.id) === CommandType.MUTATION && params?.unitId === patch.unitId && params.subUnitId === patch.subUnitId;
}

function executeEffects(commands: ICommandService, effects: IMutationInfo[]): void {
    for (const effect of effects) {
        if (!commands.syncExecuteCommand(effect.id, Tools.deepClone(effect.params), { onlyLocal: true })) {
            throw new Error(`Table auto expansion effect failed: ${effect.id}`);
        }
    }
}

/** Replayed initialization must still own the content it captured before the edit. */
function matchesFormulaTargets(groups: Array<{ effects: IMutationInfo[]; inverses: IMutationInfo[] }>, sheet: Worksheet): boolean {
    const pending = new Map<string, ICellData>();
    for (const group of groups) {
        const baseline = new Map<string, ICellData>();
        for (const inverse of group.inverses) {
            if (inverse.id !== SetRangeValuesMutation.id) continue;
            new ObjectMatrix((inverse.params as ISetRangeValuesMutationParams).cellValue).forValue((row, col, cell) => {
                const key = `${row}:${col}`;
                baseline.set(key, { ...baseline.get(key), ...cell });
            });
        }
        let valid = true;
        const checked = new Set<string>();
        for (const effect of group.effects) {
            if (effect.id !== SetRangeValuesMutation.id) continue;
            new ObjectMatrix((effect.params as ISetRangeValuesMutationParams).cellValue).forValue((row, col, cell) => {
                const key = `${row}:${col}`;
                const current = pending.get(key) ?? sheet.getCellRaw(row, col) ?? {};
                const before = baseline.get(key);
                if (cell?.f && before && !checked.has(key)) {
                    const fields: Array<keyof ICellData> = before.f || before.si ? ['f', 'si', 'p'] : ['f', 'si', 'p', 'v', 't'];
                    if (!fields.every((field) => Tools.diffValue(current[field] ?? null, before[field] ?? null))) valid = false;
                    checked.add(key);
                }
                pending.set(key, cell ? { ...current, ...cell } : {});
            });
        }
        if (!valid) return false;
    }
    return true;
}
