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

import type { IDisposable, IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import {
    AbsoluteRefType,
    Disposable,
    DisposableCollection,
    getIntersectRange,
    Inject,
    Injector,
    isFormulaString,
    IUniverInstanceService,
    moveRangeByOffset,
    Rectangle,
} from '@univerjs/core';
import {
    deserializeRangeWithSheetWithCache,
    ErrorType,
    generateStringWithSequence,
    LexerTreeBuilder,
    sequenceNodeType,
    serializeRange,
    serializeRangeWithSheet,
    serializeRangeWithSpreadsheet,
} from '@univerjs/engine-formula';
import {
    EffectRefRangId,
    getSeparateEffectedRangesOnCommand,
    handleCommonDefaultRangeChangeWithEffectRefCommands,
    handleDefaultRangeChangeWithEffectRefCommands,
    RefRangeService,
} from '@univerjs/sheets';
import type { IFormulaReferenceMoveParam } from '../controllers/utils/ref-range-formula';
import { getNewRangeByMoveParam } from '../controllers/utils/ref-range-move';
import { getReferenceMoveParams } from '../controllers/utils/ref-range-param';

export type FormulaChangeMap = Record<string, Record<string, Record<string, string>>>;

export type FormulaChangeCallback = (formulaString: string, commandInfo: EffectRefRangeParams) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

export type RangeFormulaChangeCallback = (
    infos: { formulas: string[]; ranges: IRange[] }[],
    commandInfo: EffectRefRangeParams
) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

function getFormulaKeyOffset(lexerTreeBuilder: LexerTreeBuilder, formulaString: string, refOffsetX: number, refOffsetY: number) {
    const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(formulaString);

    if (sequenceNodes == null) {
        return formulaString;
    }

    const newSequenceNodes: Array<{ unitId: string; sheetName: string; range: IRange }> = [];

    for (let i = 0, len = sequenceNodes.length; i < len; i++) {
        const node = sequenceNodes[i];
        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            continue;
        }

        const { token } = node;

        const sequenceGrid = deserializeRangeWithSheetWithCache(token);

        const { sheetName, unitId: sequenceUnitId } = sequenceGrid;

        let newRange: IRange = sequenceGrid.range;
        if (newRange.startAbsoluteRefType === AbsoluteRefType.ALL && newRange.endAbsoluteRefType === AbsoluteRefType.ALL) {
            continue;
        } else {
            newRange = moveRangeByOffset(newRange, refOffsetX, refOffsetY);
        }

        newSequenceNodes.push({
            unitId: sequenceUnitId,
            sheetName,
            range: newRange,
        });
    }

    return newSequenceNodes.map((item) => `${item.unitId}!${item.sheetName}!${item.range.startRow}!${item.range.endRow}!${item.range.startColumn}!${item.range.endColumn}`).join('|');
}

export class FormulaRefRangeService extends Disposable {
    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    /** Cross-sheet CUT partitions. Each formula is anchored at its partition's first range. */
    getRangeFormulaChanges(
        unitId: string,
        subUnitId: string,
        oldRanges: IRange[],
        formulas: string[],
        commandInfo: EffectRefRangeParams,
        offsetFormula = true
    ) {
        const original = [{ unitId, subUnitId, ranges: oldRanges, formulas, moved: false }];
        if (commandInfo.id !== EffectRefRangId.MoveRangeCommandId || !commandInfo.params || !oldRanges.length) {
            return original;
        }
        const sourceUnitId = commandInfo.params.fromUnitId;
        const sourceWorkbook = sourceUnitId ? this._univerInstanceService.getUnit<Workbook>(sourceUnitId) : null;
        if (!sourceWorkbook) {
            return original;
        }
        const move = getReferenceMoveParams(sourceWorkbook, commandInfo);
        if (!move || !move.from || !move.to || move.unitId !== move.targetUnitId || move.sheetId === move.targetSheetId) {
            return original;
        }
        const origin = oldRanges[0];
        const sourceOwner = unitId === move.unitId && subUnitId === move.sheetId;
        const targetOwner = unitId === move.targetUnitId && subUnitId === move.targetSheetId;
        const formulaDeps = formulas.flatMap((formula) => this._getFormulaDependcy(unitId, subUnitId, formula, oldRanges));
        const boundaries: IRange[] = [];
        if (sourceOwner || targetOwner) {
            const effect = sourceOwner ? move.from : move.to;
            for (const range of oldRanges) {
                const intersect = getIntersectRange(range, effect);
                if (intersect) {
                    boundaries.push(intersect);
                }
            }
        }
        if (offsetFormula) {
            for (const dep of formulaDeps) {
                if (dep.unitId === move.unitId && dep.subUnitId === move.sheetId) {
                    for (const reference of this._getPartitionReferences(dep.referenceRange)) {
                        boundaries.push(...this._getAffectedOwnerRanges(
                            reference,
                            move.from,
                            oldRanges,
                            origin.startRow,
                            origin.startColumn
                        ));
                    }
                }
            }
        }
        if (!boundaries.length && !formulaDeps.some((dep) =>
            dep.unitId === move.unitId && dep.subUnitId === move.sheetId && !!getIntersectRange(dep.referenceRange, move.from!)
        )) {
            return original;
        }
        const grid = Rectangle.splitIntoGrid(boundaries);
        const pieces = [...grid, ...Rectangle.subtractMulti(oldRanges, grid)];
        pieces.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);
        const groups = new Map<string, { unitId: string; subUnitId: string; ranges: IRange[]; formulas: string[]; moved: boolean }>();
        for (const piece of pieces) {
            if (targetOwner && getIntersectRange(piece, move.to)) {
                continue;
            }
            const moved = sourceOwner && !!getIntersectRange(piece, move.from);
            const nextUnitId = moved ? move.targetUnitId! : unitId;
            const nextSubUnitId = moved ? move.targetSheetId! : subUnitId;
            const nextRange = moved
                ? Rectangle.moveOffset(piece, move.to.startColumn - move.from.startColumn, move.to.startRow - move.from.startRow)
                : piece;
            const nextFormulas = formulas.map((formula) => {
                if (!isFormulaString(formula)) {
                    return formula;
                }
                const anchored = offsetFormula
                    ? this._lexerTreeBuilder.moveFormulaRefOffset(
                        formula,
                        piece.startColumn - origin.startColumn,
                        piece.startRow - origin.startRow
                    )
                    : formula;
                return this._transformMoveFormula(unitId, subUnitId, anchored, move, nextUnitId, nextSubUnitId, moved);
            });
            // Normalize the complete expression, retaining absolute references and qualifiers.
            const key = JSON.stringify([nextUnitId, nextSubUnitId, moved, nextFormulas.map((formula) => {
                if (!offsetFormula || !isFormulaString(formula)) {
                    return formula;
                }
                return this._getMoveFormulaKey(formula, nextRange);
            })]);
            const group = groups.get(key);
            if (group) {
                group.ranges.push(nextRange);
            } else {
                groups.set(key, { unitId: nextUnitId, subUnitId: nextSubUnitId, ranges: [nextRange], formulas: nextFormulas, moved });
            }
        }
        return [...groups.values()].map((group) => ({
            ...group,
            ranges: Rectangle.mergeRanges(group.ranges).sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn),
        }));
    }

    private _getMoveFormulaKey(formula: string, range: IRange) {
        return this._lexerTreeBuilder.sequenceNodesBuilder(formula)?.map((node) => {
            if (typeof node === 'string') {
                return node;
            }
            if (node.nodeType !== sequenceNodeType.REFERENCE) {
                return { nodeType: node.nodeType, token: node.token };
            }
            const ref = deserializeRangeWithSheetWithCache(node.token);
            return { ...ref, range: moveRangeByOffset(ref.range, -range.startColumn, -range.startRow) };
        });
    }

    private _getPartitionReferences(range: IRange) {
        return [range, {
            ...range,
            endRow: range.startRow,
            endColumn: range.startColumn,
            endAbsoluteRefType: range.startAbsoluteRefType,
        }, {
            ...range,
            startRow: range.endRow,
            startColumn: range.endColumn,
            startAbsoluteRefType: range.endAbsoluteRefType,
        }];
    }

    private _transformMoveFormula(
        unitId: string,
        subUnitId: string,
        formula: string,
        move: IFormulaReferenceMoveParam,
        nextUnitId: string,
        nextSubUnitId: string,
        moved: boolean
    ) {
        const nodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const transformed = nodes?.map((node) => {
            if (typeof node !== 'string' && node.nodeType === sequenceNodeType.STRING) {
                return { ...node, token: `"${node.token.slice(1, -1).split('"').join('""')}"` };
            }
            if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
                return node;
            }
            const ref = deserializeRangeWithSheetWithCache(node.token);
            const workbook = this._univerInstanceService.getUnit<Workbook>(ref.unitId || unitId);
            const sheet = ref.sheetName ? workbook?.getSheetBySheetName(ref.sheetName) : workbook?.getSheetBySheetId(subUnitId);
            if (!workbook || !sheet) {
                return node;
            }
            const token = getNewRangeByMoveParam({
                unitId: workbook.getUnitId(),
                sheetId: sheet.getSheetId(),
                sheetName: sheet.getName(),
                range: ref.range,
                refOffsetX: 0,
                refOffsetY: 0,
            }, move, nextUnitId, nextSubUnitId, { preserveSheetQualifier: !!ref.sheetName });
            if (token != null) {
                return { ...node, token };
            }
            // References left behind by a moved owner stay on their original worksheet.
            if (moved && workbook.getUnitId() === unitId && sheet.getSheetId() === subUnitId) {
                return { ...node, token: serializeRangeWithSheet(sheet.getName(), ref.range) };
            }
            return node;
        });
        return transformed ? `=${generateStringWithSequence(transformed)}` : formula;
    }

    transformFormulaByEffectCommand(unitId: string, subUnitId: string, formula: string, params: EffectRefRangeParams) {
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const effectedRanges = getSeparateEffectedRangesOnCommand(this._injector, params);
        if (!effectedRanges) {
            return formula;
        }

        const transformSequenceNodes = sequenceNodes?.map((node) => {
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const gridRangeName = deserializeRangeWithSheetWithCache(node.token);
                const { range, unitId: rangeUnitId, sheetName: rangeSheetName } = gridRangeName;
                const workbook = this._univerInstanceService.getUnit<Workbook>(rangeUnitId || unitId);
                const worksheet = rangeSheetName ? workbook?.getSheetBySheetName(rangeSheetName) : workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    throw new Error('Sheet not found');
                }

                const realUnitId = workbook!.getUnitId();
                const realSheetId = worksheet.getSheetId();
                if ((realUnitId !== effectedRanges.unitId) || (realSheetId !== effectedRanges.subUnitId)) {
                    return node;
                }
                const newRange = handleDefaultRangeChangeWithEffectRefCommands(range, params);
                let newToken = '';

                if (newRange) {
                    const finalRange = { ...range, ...newRange };
                    if (rangeUnitId && rangeSheetName) {
                        newToken = serializeRangeWithSpreadsheet(rangeUnitId, rangeSheetName, finalRange);
                    } else if (rangeSheetName) {
                        newToken = serializeRangeWithSheet(rangeSheetName, finalRange);
                    } else {
                        newToken = serializeRange(finalRange);
                    }
                } else {
                    newToken = ErrorType.REF;
                }

                return {
                    ...node,
                    token: newToken,
                };
            } else {
                return node;
            };
        });

        return transformSequenceNodes ? `=${generateStringWithSequence(transformSequenceNodes)}` : '';
    }

    private _transformRangeFormula(
        unitId: string,
        subUnitId: string,
        formula: string,
        commandInfo: EffectRefRangeParams,
        sourceRange: IRange,
        targetRange: IRange,
        ownerRangeAffected: boolean
    ) {
        const transformedFormula = this.transformFormulaByEffectCommand(unitId, subUnitId, formula, commandInfo);
        if (!ownerRangeAffected || (
            commandInfo.id !== EffectRefRangId.InsertRowCommandId
            && commandInfo.id !== EffectRefRangId.InsertColCommandId
        )) {
            return transformedFormula;
        }

        // Before-insert ranges include inherited cells preceding the moved original formula anchor.
        const movedAnchor = handleDefaultRangeChangeWithEffectRefCommands({
            startRow: sourceRange.startRow,
            endRow: sourceRange.startRow,
            startColumn: sourceRange.startColumn,
            endColumn: sourceRange.startColumn,
        }, commandInfo);
        if (!movedAnchor) {
            return transformedFormula;
        }
        const offsetRow = targetRange.startRow - movedAnchor.startRow;
        const offsetColumn = targetRange.startColumn - movedAnchor.startColumn;
        return offsetRow || offsetColumn
            ? this._lexerTreeBuilder.moveFormulaRefOffset(transformedFormula, offsetColumn, offsetRow)
            : transformedFormula;
    }

    registerFormula(unitId: string, subUnitId: string, formula: string, callback: FormulaChangeCallback): IDisposable {
        const rangeMap = new Map<string, { unitId: string; subUnitId: string; range: IRange; sheetName: string }>();
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const disposableCollection = new DisposableCollection();
        const handleChange = (params: EffectRefRangeParams) => {
            const effectedRanges = getSeparateEffectedRangesOnCommand(this._injector, params);
            if (!effectedRanges) {
                return { redos: [], undos: [] };
            }

            const transformSequenceNodes = sequenceNodes?.map((node) => {
                if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                    const rangeInfo = rangeMap.get(node.token)!;
                    if ((rangeInfo.unitId !== effectedRanges.unitId) || (rangeInfo.subUnitId !== effectedRanges.subUnitId)) {
                        return node;
                    }

                    const newRange = handleDefaultRangeChangeWithEffectRefCommands(rangeInfo.range, params);
                    let newToken = '';

                    if (newRange) {
                        const finalRange = { ...rangeInfo.range, ...newRange };
                        if (rangeInfo.unitId && rangeInfo.sheetName) {
                            newToken = serializeRangeWithSpreadsheet(rangeInfo.unitId, rangeInfo.sheetName, finalRange);
                        } else if (rangeInfo.sheetName) {
                            newToken = serializeRangeWithSheet(rangeInfo.sheetName, finalRange);
                        } else {
                            newToken = serializeRange(finalRange);
                        }
                    } else {
                        newToken = ErrorType.REF;
                    }

                    return {
                        ...node,
                        token: newToken,
                    };
                } else {
                    return node;
                };
            });
            const newFormulaString = transformSequenceNodes && generateStringWithSequence(transformSequenceNodes);
            return callback(`=${newFormulaString}`, params);
        };

        sequenceNodes?.forEach((node) => {
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const gridRangeName = deserializeRangeWithSheetWithCache(node.token);
                const { range, unitId: rangeUnitId, sheetName: rangeSheetName } = gridRangeName;
                const workbook = this._univerInstanceService.getUnit<Workbook>(rangeUnitId || unitId);
                const worksheet = rangeSheetName ? workbook?.getSheetBySheetName(rangeSheetName) : workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return;
                }
                const realUnitId = workbook!.getUnitId();
                const realSheetId = worksheet.getSheetId();
                const item = {
                    unitId: realUnitId,
                    subUnitId: realSheetId,
                    range,
                    sheetName: rangeSheetName,
                };
                rangeMap.set(node.token, item);
                disposableCollection.add(this._refRangeService.registerRefRange(range, handleChange, realUnitId, realSheetId));
            }
        });

        return disposableCollection;
    }

    private _getFormulaDependcy(unitId: string, subUnitId: string, formula: string | undefined, ranges: IRange[]) {
        const nodes = isFormulaString(formula) ? this._lexerTreeBuilder.sequenceNodesBuilder(formula!) : null;

        const dependencyRanges: {
            unitId: string;
            subUnitId: string;
            ranges: IRange[];
            referenceRange: IRange;
        }[] = [];
        nodes?.forEach((node) => {
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const gridRangeName = deserializeRangeWithSheetWithCache(node.token);
                const { range, unitId: rangeUnitId, sheetName: rangeSheetName } = gridRangeName;
                const workbook = this._univerInstanceService.getUnit<Workbook>(rangeUnitId || unitId);
                const worksheet = rangeSheetName ? workbook?.getSheetBySheetName(rangeSheetName) : workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return;
                }
                const realUnitId = workbook!.getUnitId();
                const realSheetId = worksheet.getSheetId();
                const orginStartRow = ranges[0].startRow;
                const orginStartColumn = ranges[0].startColumn;
                const offsetRanges = ranges.map((ownerRange) => {
                    const first = moveRangeByOffset(range, ownerRange.startColumn - orginStartColumn, ownerRange.startRow - orginStartRow);
                    const last = moveRangeByOffset(range, ownerRange.endColumn - orginStartColumn, ownerRange.endRow - orginStartRow);
                    return {
                        startRow: Math.min(first.startRow, last.startRow),
                        endRow: Math.max(first.endRow, last.endRow),
                        startColumn: Math.min(first.startColumn, last.startColumn),
                        endColumn: Math.max(first.endColumn, last.endColumn),
                    };
                });

                dependencyRanges.push({
                    unitId: realUnitId,
                    subUnitId: realSheetId,
                    ranges: offsetRanges,
                    referenceRange: range,
                });
            }
        });

        return dependencyRanges;
    }

    private _getAffectedOwnerRanges(
        referenceRange: IRange,
        effectRange: IRange,
        ownerRanges: IRange[],
        originStartRow: number,
        originStartColumn: number
    ): IRange[] {
        const startFixed = referenceRange.startAbsoluteRefType || AbsoluteRefType.NONE;
        const endFixed = referenceRange.endAbsoluteRefType || AbsoluteRefType.NONE;
        if (
            (startFixed & AbsoluteRefType.ROW && referenceRange.startRow > effectRange.endRow)
            || (endFixed & AbsoluteRefType.ROW && referenceRange.endRow < effectRange.startRow)
            || (startFixed & AbsoluteRefType.COLUMN && referenceRange.startColumn > effectRange.endColumn)
            || (endFixed & AbsoluteRefType.COLUMN && referenceRange.endColumn < effectRange.startColumn)
        ) {
            return [];
        }
        return ownerRanges.flatMap((ownerRange) => {
            const projected = getIntersectRange({
                startRow: endFixed & AbsoluteRefType.ROW ? ownerRange.startRow : originStartRow + effectRange.startRow - referenceRange.endRow,
                endRow: startFixed & AbsoluteRefType.ROW ? ownerRange.endRow : originStartRow + effectRange.endRow - referenceRange.startRow,
                startColumn: endFixed & AbsoluteRefType.COLUMN ? ownerRange.startColumn : originStartColumn + effectRange.startColumn - referenceRange.endColumn,
                endColumn: startFixed & AbsoluteRefType.COLUMN ? ownerRange.endColumn : originStartColumn + effectRange.endColumn - referenceRange.startColumn,
            }, ownerRange);
            return projected ? [projected] : [];
        });
    }

    // eslint-disable-next-line max-lines-per-function
    registerRangeFormula(unitId: string, subUnitId: string, oldRanges: IRange[], formulas: string[], callback: RangeFormulaChangeCallback): IDisposable {
        const disposableCollection = new DisposableCollection();
        const formulaDeps = formulas.map((formula) => this._getFormulaDependcy(unitId, subUnitId, formula, oldRanges));
        // eslint-disable-next-line max-lines-per-function
        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            const effectedRanges = getSeparateEffectedRangesOnCommand(this._injector, commandInfo);
            if (!effectedRanges) {
                return {
                    undos: [],
                    redos: [],
                };
            }

            const ownerRangeAffected = effectedRanges.unitId === unitId && effectedRanges.subUnitId === subUnitId;
            const originStartRow = oldRanges[0].startRow;
            const originStartColumn = oldRanges[0].startColumn;
            const deps = [{
                unitId,
                subUnitId,
                ranges: oldRanges,
                referenceRange: {
                    startRow: originStartRow,
                    endRow: originStartRow,
                    startColumn: originStartColumn,
                    endColumn: originStartColumn,
                },
            }, ...formulaDeps.flat()];
            const matchedEffectedRanges: IRange[][] = [];

            // 1. calculate effected ranges
            for (const { unitId: depUnitId, subUnitId: depSubUnitId, ranges, referenceRange } of deps) {
                if (depUnitId === effectedRanges.unitId && depSubUnitId === effectedRanges.subUnitId) {
                    const intersectedRanges: IRange[] = [];

                    for (const range of effectedRanges.ranges) {
                        const intersectedRange: IRange[] = [];
                        for (const r of ranges) {
                            const intersect = getIntersectRange(range, r);
                            if (intersect) {
                                intersectedRange.push(intersect);
                            }
                        }
                        if (intersectedRange.length > 0) {
                            intersectedRanges.push(...intersectedRange);
                        }
                    }

                    if (intersectedRanges.length > 0) {
                        // Endpoint boundaries separate fully transformed references from partial overlaps.
                        const partitionReferences = this._getPartitionReferences(referenceRange);
                        matchedEffectedRanges.push(
                            intersectedRanges.flatMap((range) => partitionReferences.flatMap((reference) =>
                                this._getAffectedOwnerRanges(reference, range, oldRanges, originStartRow, originStartColumn)
                            ))
                        );
                    }
                }
            }

            if (matchedEffectedRanges.length > 0) {
                // 2. split effected ranges to enusre there is no overlap
                const ranges = Rectangle.splitIntoGrid([...matchedEffectedRanges.flat()]);
                const noEffectRanges = Rectangle.subtractMulti(oldRanges, ranges);
                noEffectRanges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);

                // 3. calculate every effected range to get new range and new formula
                const keyMap = new Map<string, { formulas: { newFormula: string }[]; ranges: IRange[] }[]>();
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const currentRow = range.startRow;
                    const currentColumn = range.startColumn;
                    const offsetRow = currentRow - originStartRow;
                    const offsetColumn = currentColumn - originStartColumn;
                    const transformedRange = ownerRangeAffected
                        ? handleCommonDefaultRangeChangeWithEffectRefCommands(range, commandInfo).sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn)
                        : [range];
                    if (!transformedRange.length) {
                        continue;
                    }
                    const transformedRow = transformedRange[0].startRow;
                    const transformedColumn = transformedRange[0].startColumn;
                    const transformedOffsetRow = transformedRow - originStartRow;
                    const transformedOffsetColumn = transformedColumn - originStartColumn;

                    const transformedFormulas = [];
                    for (let j = 0; j < formulas.length; j++) {
                        const formula = formulas[j];
                        const isFormulaFormulaString = isFormulaString(formula);
                        // 3.1 move formula ref offset to get formula string for this range before this command
                        const formulaString = isFormulaFormulaString ? this._lexerTreeBuilder.moveFormulaRefOffset(formula!, offsetColumn, offsetRow) : formula!;
                        // 3.2 transform formula by effect command
                        const newFormula = isFormulaFormulaString
                            ? this._transformRangeFormula(unitId, subUnitId, formulaString, commandInfo, range, transformedRange[0], ownerRangeAffected)
                            : formulaString;
                        // 3.3 get formula key offset for this range after this command
                        const orginFormula = getFormulaKeyOffset(this._lexerTreeBuilder, newFormula, -transformedOffsetColumn, -transformedOffsetRow);
                        transformedFormulas.push({
                            newFormula,
                            orginFormula,
                        });
                    }

                    const item = {
                        formulas: transformedFormulas,
                        ranges: transformedRange,
                        key: transformedFormulas.map((item) => item.orginFormula).join('_'),
                    };

                    if (keyMap.has(item.key)) {
                        keyMap.get(item.key)!.push(item);
                    } else {
                        keyMap.set(item.key, [item]);
                    }
                }

                // 4. handle no effected ranges
                const originKey = formulas.map((item) => getFormulaKeyOffset(this._lexerTreeBuilder, item, 0, 0)).join('_');
                if (noEffectRanges.length > 0) {
                    const currentRow = noEffectRanges[0].startRow;
                    const currentColumn = noEffectRanges[0].startColumn;
                    const noEffectFormulas = [];
                    for (let i = 0; i < formulas.length; i++) {
                        const formula = formulas[i];
                        noEffectFormulas.push({
                            newFormula: isFormulaString(formula) ? this._lexerTreeBuilder.moveFormulaRefOffset(formula, currentColumn - originStartColumn, currentRow - originStartRow) : formula,
                            orginFormula: formula,
                        });
                    }

                    const item = {
                        formulas: noEffectFormulas,
                        ranges: noEffectRanges,
                        key: originKey,
                    };

                    if (keyMap.has(item.key)) {
                        keyMap.get(item.key)!.push(item);
                    } else {
                        keyMap.set(item.key, [item]);
                    }
                }

                // 5. merge effected ranges and get new formula,
                //    if origin formula was same, means these ranges can use same formula
                const res = [];
                const keys = Array.from(keyMap.keys());
                for (let i = keys.length - 1; i >= 0; i--) {
                    const key = keys[i];
                    const ranges = keyMap.get(key)!.sort((a, b) => a.ranges[0].startRow - b.ranges[0].startRow || a.ranges[0].startColumn - b.ranges[0].startColumn);
                    const formulas = [];
                    for (let j = 0; j < ranges[0].formulas.length; j++) {
                        formulas.push(ranges[0].formulas[j].newFormula);
                    }
                    const newRanges = Rectangle.mergeRanges(ranges.map((item) => item.ranges).flat());
                    newRanges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);

                    res.push({
                        formulas,
                        ranges: newRanges,
                    });
                }

                return callback(res, commandInfo);
            }

            return {
                undos: [],
                redos: [],
            };
        };

        oldRanges.forEach((range) => {
            const disposable = this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId);
            disposableCollection.add(disposable);
        });

        [...formulaDeps.flat()].forEach(({ unitId, subUnitId, ranges }) => {
            ranges.forEach((range) => {
                const disposable = this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId);
                disposableCollection.add(disposable);
            });
        });

        return disposableCollection;
    }
}
