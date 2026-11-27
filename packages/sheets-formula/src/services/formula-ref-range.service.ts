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
import type { EffectRefRangeParams, IInsertColCommandParams, IInsertRowCommandParams } from '@univerjs/sheets';
import { AbsoluteRefType, Disposable, DisposableCollection, getIntersectRange, Inject, Injector, isFormulaString, IUniverInstanceService, moveRangeByOffset, RANGE_TYPE, Rectangle } from '@univerjs/core';
import { deserializeRangeWithSheetWithCache, ErrorType, generateStringWithSequence, LexerTreeBuilder, sequenceNodeType, serializeRange, serializeRangeWithSheet, serializeRangeWithSpreadsheet } from '@univerjs/engine-formula';
import { EffectRefRangId, getSeparateEffectedRangesOnCommand, handleCommonDefaultRangeChangeWithEffectRefCommands, handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';

export type FormulaChangeMap = Record<string, Record<string, Record<string, string>>>;

export type FormulaChangeCallback = (formulaString: string) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

export type RangeFormulaChangeCallback = (infos: { formulas: string[]; ranges: IRange[] }[]) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

interface IRangeFormulaItem {
    formulas: { newFormula: string; orginFormula: string }[];
    ranges: IRange[];
    key: string;
}

/**
 * An inserted row or column that lands inside a registered range stays part of that range, the
 * same way {@link handleCommonDefaultRangeChangeWithEffectRefCommands} expands a range when the
 * insertion happens inside it. `registerRangeFormula` splits a range into the segments that are
 * affected by a command, and an inserted block is not part of any segment, so it has to be
 * collected separately, otherwise the inserted cells would silently drop out of the range.
 */
function getInsertedBlocks(command: EffectRefRangeParams, ranges: IRange[]): IRange[] {
    const params = command.params as IInsertRowCommandParams | IInsertColCommandParams | undefined;
    if (!params?.range) {
        return [];
    }

    switch (command.id) {
        case EffectRefRangId.InsertRowCommandId: {
            const { startRow, endRow } = params.range;
            return ranges
                .filter((range) => startRow > range.startRow && startRow <= range.endRow)
                .map((range) => ({
                    startRow,
                    endRow,
                    startColumn: range.startColumn,
                    endColumn: range.endColumn,
                }));
        }
        case EffectRefRangId.InsertColCommandId: {
            const { startColumn, endColumn } = params.range;
            return ranges
                .filter((range) => startColumn > range.startColumn && startColumn <= range.endColumn)
                .map((range) => ({
                    startRow: range.startRow,
                    endRow: range.endRow,
                    startColumn,
                    endColumn,
                }));
        }
        default:
            return [];
    }
}

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

    transformFormulaByEffectCommand(unitId: string, subUnitId: string, formula: string, params: EffectRefRangeParams) {
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const effectedRanges = getSeparateEffectedRangesOnCommand(this._injector, params);

        if (effectedRanges == null) {
            return formula;
        }

        const { unitId: effectedUnitId, subUnitId: effectedSubUnitId } = effectedRanges;

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
                // Only the cells of the edited sheet move, so a reference on another sheet is
                // left alone even though the command may have triggered the callback.
                if ((realUnitId !== effectedUnitId) || (realSheetId !== effectedSubUnitId)) {
                    return node;
                }
                const newRange = handleDefaultRangeChangeWithEffectRefCommands(range, params);
                let newToken = '';

                if (newRange) {
                    // The handlers move the whole range, so use their result directly: taking
                    // only the offset of its first cell would drop a range that grows or
                    // shrinks. Absolute flags are part of the reference text and do not change
                    // when rows or columns are inserted, removed or moved.
                    const finalRange = {
                        ...newRange,
                        startAbsoluteRefType: range.startAbsoluteRefType,
                        endAbsoluteRefType: range.endAbsoluteRefType,
                        rangeType: range.rangeType,
                    };
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

    registerFormula(unitId: string, subUnitId: string, formula: string, callback: FormulaChangeCallback): IDisposable {
        const rangeMap = new Map<string, { unitId: string; subUnitId: string; range: IRange; sheetName: string }>();
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const disposableCollection = new DisposableCollection();
        const handleChange = (params: EffectRefRangeParams) => {
            const effectedRanges = getSeparateEffectedRangesOnCommand(this._injector, params);

            if (effectedRanges == null) {
                return callback(formula);
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
                        const finalRange = {
                            ...newRange,
                            startAbsoluteRefType: rangeInfo.range.startAbsoluteRefType,
                            endAbsoluteRefType: rangeInfo.range.endAbsoluteRefType,
                            rangeType: rangeInfo.range.rangeType,
                        };
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
            return callback(`=${newFormulaString}`);
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

        const dependencyRanges: { unitId: string; subUnitId: string; ranges: IRange[]; affectsRuleRanges: boolean }[] = [];
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
                const currentStartRow = range.startRow;
                const currentStartColumn = range.startColumn;

                // An absolute reference is pinned against copy and fill, not against row and
                // column insertion or deletion, so it has to be watched as well. It stays one
                // range for every cell of the rule, though, and therefore does not split the
                // rule ranges the way a relative reference does.
                const isAbsolute = range.startAbsoluteRefType === AbsoluteRefType.ALL && range.endAbsoluteRefType === AbsoluteRefType.ALL;
                const offsetRanges = isAbsolute
                    ? [range]
                    : ranges.map((range) => ({
                        startRow: range.startRow - orginStartRow + currentStartRow,
                        endRow: range.endRow - orginStartRow + currentStartRow,
                        startColumn: range.startColumn - orginStartColumn + currentStartColumn,
                        endColumn: range.endColumn - orginStartColumn + currentStartColumn,
                    }));

                dependencyRanges.push({
                    unitId: realUnitId,
                    subUnitId: realSheetId,
                    ranges: offsetRanges,
                    affectsRuleRanges: !isAbsolute,
                });
            }
        });

        return dependencyRanges;
    }

    // eslint-disable-next-line max-lines-per-function
    registerRangeFormula(unitId: string, subUnitId: string, oldRanges: IRange[], formulas: string[], callback: RangeFormulaChangeCallback): IDisposable {
        const disposableCollection = new DisposableCollection();
        const formulaDeps = formulas.map((formula) => this._getFormulaDependcy(unitId, subUnitId, formula, oldRanges));
        // eslint-disable-next-line max-lines-per-function, complexity
        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            const effectedRanges = getSeparateEffectedRangesOnCommand(this._injector, commandInfo);
            if (!effectedRanges) {
                return {
                    undos: [],
                    redos: [],
                };
            }

            // A command on another sheet never moves the rule's own ranges. The rule may still
            // reference the edited sheet, in which case only the formula follows the cells.
            if (effectedRanges.unitId !== unitId || effectedRanges.subUnitId !== subUnitId) {
                return this._transformFormulasOnly(unitId, subUnitId, oldRanges, formulas, commandInfo, callback);
            }

            const wholeRangeResult = this._transformWholeRangeFormulas(unitId, subUnitId, oldRanges, formulas, commandInfo);
            if (wholeRangeResult) {
                return callback(wholeRangeResult);
            }

            const originStartRow = oldRanges[0].startRow;
            const originStartColumn = oldRanges[0].startColumn;
            const deps = [
                { unitId, subUnitId, ranges: oldRanges },
                ...formulaDeps.flat().filter((dep) => dep.affectsRuleRanges),
            ];
            const matchedEffectedRanges: IRange[][] = [];

            // 1. calculate effected ranges
            for (const { unitId: depUnitId, subUnitId: depSubUnitId, ranges } of deps) {
                if (depUnitId === effectedRanges.unitId && depSubUnitId === effectedRanges.subUnitId) {
                    const intersectedRanges: IRange[] = [];
                    const currentStartRow = ranges[0].startRow;
                    const currentStartColumn = ranges[0].startColumn;
                    const offsetRow = currentStartRow - originStartRow;
                    const offsetColumn = currentStartColumn - originStartColumn;

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
                        matchedEffectedRanges.push(
                            intersectedRanges.map((range) => ({
                                startRow: range.startRow - offsetRow,
                                endRow: range.endRow - offsetRow,
                                startColumn: range.startColumn - offsetColumn,
                                endColumn: range.endColumn - offsetColumn,
                            }))
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
                const keyMap = new Map<string, IRangeFormulaItem[]>();
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const currentRow = range.startRow;
                    const currentColumn = range.startColumn;
                    const offsetRow = currentRow - originStartRow;
                    const offsetColumn = currentColumn - originStartColumn;
                    const transformedRange = handleCommonDefaultRangeChangeWithEffectRefCommands(range, commandInfo).sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);
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
                        const newFormula = isFormulaFormulaString ? this.transformFormulaByEffectCommand(unitId, subUnitId, formulaString, commandInfo) : formulaString;
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
                        const isFormulaFormulaString = isFormulaString(formula);
                        // a segment outside the effected ranges keeps its cells, but its
                        // references still follow the command, for example when a removed
                        // row shrinks them or an absolute reference shifts with an insert
                        const formulaString = isFormulaFormulaString ? this._lexerTreeBuilder.moveFormulaRefOffset(formula, currentColumn - originStartColumn, currentRow - originStartRow) : formula;
                        const newFormula = isFormulaFormulaString ? this.transformFormulaByEffectCommand(unitId, subUnitId, formulaString!, commandInfo) : formulaString;
                        noEffectFormulas.push({
                            newFormula,
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

                // 4.1 the inserted row/column block itself is not part of any segment but stays
                //     covered by the range it was inserted into
                this._appendInsertedBlockItems(keyMap, commandInfo, oldRanges, formulas, oldRanges[0], originKey);

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

                return callback(res);
            }

            // No rule range moves, but a reference on the edited sheet may still have moved,
            // for example when the command is above a referenced cell but below the rule range.
            return this._transformFormulasOnly(unitId, subUnitId, oldRanges, formulas, commandInfo, callback);
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

    /**
     * Keeps the rule ranges in place and only rewrites the formulas, for commands that move
     * referenced cells without touching the rule itself.
     */
    private _transformFormulasOnly(
        unitId: string,
        subUnitId: string,
        ranges: IRange[],
        formulas: string[],
        commandInfo: EffectRefRangeParams,
        callback: RangeFormulaChangeCallback
    ) {
        const newFormulas = formulas.map((formula) => (isFormulaString(formula) ? this.transformFormulaByEffectCommand(unitId, subUnitId, formula, commandInfo) : formula));

        if (newFormulas.every((formula, index) => formula === formulas[index])) {
            return {
                undos: [],
                redos: [],
            };
        }

        return callback([{ formulas: newFormulas, ranges }]);
    }

    /**
     * A whole column/row/sheet range keeps its anchor, so it is adjusted as a single range:
     * segmenting it would both split the rule and drop the range type.
     *
     * @returns the single rule range to apply, or `undefined` when the regular segmentation applies
     */
    private _transformWholeRangeFormulas(
        unitId: string,
        subUnitId: string,
        oldRanges: IRange[],
        formulas: string[],
        commandInfo: EffectRefRangeParams
    ): { formulas: string[]; ranges: IRange[] }[] | undefined {
        const ruleRangeType = oldRanges[0]?.rangeType ?? RANGE_TYPE.NORMAL;
        if (ruleRangeType === RANGE_TYPE.NORMAL || !oldRanges.every((range) => range.rangeType === ruleRangeType)) {
            return undefined;
        }

        const ranges = handleCommonDefaultRangeChangeWithEffectRefCommands(oldRanges[0], commandInfo);
        if (!ranges.length) {
            return [];
        }

        return [{
            formulas: formulas.map((formula) => (isFormulaString(formula) ? this.transformFormulaByEffectCommand(unitId, subUnitId, formula, commandInfo) : formula)),
            ranges,
        }];
    }

    private _appendInsertedBlockItems(
        keyMap: Map<string, IRangeFormulaItem[]>,
        commandInfo: EffectRefRangeParams,
        oldRanges: IRange[],
        formulas: string[],
        origin: IRange,
        originKey: string
    ) {
        for (const block of getInsertedBlocks(commandInfo, oldRanges)) {
            const offsetRow = block.startRow - origin.startRow;
            const offsetColumn = block.startColumn - origin.startColumn;
            const blockFormulas = formulas.map((formula) => ({
                newFormula: isFormulaString(formula) ? this._lexerTreeBuilder.moveFormulaRefOffset(formula, offsetColumn, offsetRow) : formula,
                orginFormula: formula,
            }));
            const item: IRangeFormulaItem = {
                formulas: blockFormulas,
                ranges: [block],
                key: originKey,
            };
            const items = keyMap.get(item.key);

            if (items) {
                items.push(item);
            } else {
                keyMap.set(item.key, [item]);
            }
        }
    }
}
