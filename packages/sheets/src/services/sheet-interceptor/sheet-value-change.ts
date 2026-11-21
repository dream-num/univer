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

import type {
    ICellData,
    ICommandService,
    IMutationInfo,
    IObjectMatrixPrimitiveType,
    IRange,
    Nullable,
    Worksheet,
} from '@univerjs/core';
import { getIntersectRange, ObjectMatrix, Tools } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '../../commands/mutations/numfmt.mutation';
import type { ISetRangeValuesMutationParams } from '../../commands/mutations/set-range-values.mutation';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '../../commands/mutations/numfmt.mutation';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';

export interface ISheetValueChangeContext {
    unitId: string;
    subUnitId: string;
    source: 'editor' | 'paste' | 'fill';
    ranges: IRange[];
    /** An existing entry with null is an explicit blank; a missing entry is not written. */
    contentWrites: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
    beforeCells: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
    /** Explicit numeric format fields, clears or native format mutations; font-only writes do not qualify. */
    explicitStyleRanges: IRange[];
    explicitValidationRanges: IRange[];
    /** Final native writes, available to their owning optional plugins when preparing effects. */
    mutations?: readonly IMutationInfo[];
}

/** One optional, atomic affiliated mutation and its inverse. Failed effects never enter history. */
export interface ISheetValueChangeEffect {
    redo: IMutationInfo;
    undo: IMutationInfo;
}

export function createSheetValueChangeContext(
    unitId: string,
    subUnitId: string,
    source: ISheetValueChangeContext['source'],
    worksheet: Worksheet,
    mutations: readonly IMutationInfo[],
    ranges?: IRange[]
): ISheetValueChangeContext | undefined {
    const contentWrites = new ObjectMatrix<Nullable<ICellData>>();
    const beforeCells = new ObjectMatrix<Nullable<ICellData>>();
    const explicitStyleRanges = getExplicitNumberFormatRanges(worksheet, source, mutations, unitId, subUnitId);
    for (const mutation of mutations) {
        if (mutation.id !== SetRangeValuesMutation.id) {
            continue;
        }
        const params = mutation.params as ISetRangeValuesMutationParams;
        if (params.unitId !== unitId || params.subUnitId !== subUnitId) {
            continue;
        }
        new ObjectMatrix(params.cellValue).forValue((row, col, cell) => {
            if (!beforeCells.getValue(row, col)) {
                beforeCells.setValue(row, col, Tools.deepClone(worksheet.getCellRaw(row, col) ?? null));
            }
            if (cell === null || (cell && ['v', 'f', 'si', 'p'].some((key) => Object.prototype.hasOwnProperty.call(cell, key)))) {
                const previous = contentWrites.getValue(row, col);
                contentWrites.setValue(row, col, cell === null ? null : { ...previous, ...Tools.deepClone(cell) });
            }
        });
    }
    if (contentWrites.getSizeOf() === 0) {
        return;
    }
    if (source === 'editor') {
        let hasInput = false;
        contentWrites.forValue((_row, _col, cell) => {
            hasInput ||= !!cell && ((cell.v !== undefined && cell.v !== null && cell.v !== '') || !!cell.f || !!cell.si || !!cell.p?.body?.dataStream.replace(/\r\n$/, ''));
        });
        if (!hasInput) {
            return;
        }
    }
    return {
        unitId,
        subUnitId,
        source,
        ranges: getWrittenRanges(contentWrites.getMatrix()).flatMap((written) => ranges
            ? ranges.flatMap((target) => {
                const intersect = getIntersectRange(written, target);
                return intersect ? [intersect] : [];
            })
            : [written]),
        contentWrites: contentWrites.getMatrix(),
        beforeCells: beforeCells.getMatrix(),
        explicitStyleRanges,
        explicitValidationRanges: [],
        mutations,
    };
}

export function getExplicitNumberFormatRanges(worksheet: Worksheet, source: ISheetValueChangeContext['source'], mutations: readonly IMutationInfo[], unitId: string, subUnitId: string): IRange[] {
    const cells = new ObjectMatrix<Nullable<ICellData>>();
    const ranges: IRange[] = [];
    for (const mutation of mutations) {
        const location = mutation.params as { unitId?: string; subUnitId?: string };
        if (location?.unitId !== unitId || location.subUnitId !== subUnitId) continue;
        if (mutation.id === SetNumfmtMutation.id) {
            ranges.push(...Object.values((mutation.params as ISetNumfmtMutationParams).values).flatMap((value) => value.ranges));
        } else if (mutation.id === RemoveNumfmtMutation.id) {
            ranges.push(...(mutation.params as IRemoveNumfmtMutationParams).ranges);
        } else if (mutation.id === SetRangeValuesMutation.id && source !== 'editor') {
            const params = mutation.params as ISetRangeValuesMutationParams;
            new ObjectMatrix(params.cellValue).forValue((row, col, cell) => {
                const style = typeof cell?.s === 'string' ? worksheet.getStyleDataByHash(cell.s) : cell?.s;
                if (cell === null || cell?.s === null || (cell?.s !== undefined && params.isOverrideStyle)
                    || (style && Object.prototype.hasOwnProperty.call(style, 'n'))) {
                    cells.setValue(row, col, {});
                }
            });
        }
    }
    return [...getWrittenRanges(cells.getMatrix()), ...ranges];
}

/** Preserve explicit blanks while keeping filtered/skipped cells out of the physical write ranges. */
function getWrittenRanges(matrix: IObjectMatrixPrimitiveType<Nullable<ICellData>>): IRange[] {
    const ranges: IRange[] = [];
    let previous = new Map<string, IRange>();
    for (const row of Object.keys(matrix).map(Number).sort((a, b) => a - b)) {
        const columns = Object.keys(matrix[row]).map(Number).sort((a, b) => a - b);
        const current = new Map<string, IRange>();
        for (let index = 0; index < columns.length; index++) {
            const startColumn = columns[index];
            let endColumn = startColumn;
            while (columns[index + 1] === endColumn + 1) {
                endColumn = columns[++index];
            }
            const key = `${startColumn}:${endColumn}`;
            const prior = previous.get(key);
            if (prior?.endRow === row - 1) {
                prior.endRow = row;
                current.set(key, prior);
            } else {
                const range = { startRow: row, endRow: row, startColumn, endColumn };
                ranges.push(range);
                current.set(key, range);
            }
        }
        previous = current;
    }
    return ranges;
}

export function executeSheetValueChangeEffects(
    effects: readonly ISheetValueChangeEffect[],
    commandService: ICommandService
): { redos: IMutationInfo[]; undos: IMutationInfo[] } {
    const redos: IMutationInfo[] = [];
    const undos: IMutationInfo[] = [];
    for (const effect of effects) {
        if (commandService.syncExecuteCommand(effect.redo.id, effect.redo.params)) {
            redos.push(effect.redo);
            undos.unshift(effect.undo);
        }
    }
    return { redos, undos };
}
