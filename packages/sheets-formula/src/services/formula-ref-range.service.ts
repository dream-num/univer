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

import type { IDisposable, IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { Disposable, DisposableCollection, getIntersectRange, Inject, Injector, isFormulaString, IUniverInstanceService, moveRangeByOffset, Rectangle, UniverInstanceType } from '@univerjs/core';
import { deserializeRangeWithSheetWithCache, ErrorType, generateStringWithSequence, LexerTreeBuilder, sequenceNodeType, serializeRange, serializeRangeWithSheet, serializeRangeWithSpreadsheet } from '@univerjs/engine-formula';
import { getSeparateEffectedRangesOnCommand, handleCommonDefaultRangeChangeWithEffectRefCommands, handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';

export type FormulaChangeMap = Record<string, Record<string, Record<string, string>>>;

export type FormulaChangeCallback = (formulaString: string) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

export type RangeFormulaChangeCallback = (infos: { formulas: string[]; originFormulas: string[]; ranges: IRange[] }[]) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

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
        const currentUnit = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const currentSheet = currentUnit.getActiveSheet();
        const currentUnitId = currentUnit.getUnitId();
        const currentSheetId = currentSheet.getSheetId();

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
                if ((realUnitId !== currentUnitId) || (realSheetId !== currentSheetId)) {
                    return node;
                }
                const newRange = handleDefaultRangeChangeWithEffectRefCommands(range, params);
                let newToken = '';

                if (newRange) {
                    const offsetX = newRange.startColumn - range.startColumn;
                    const offsetY = newRange.startRow - range.startRow;
                    const finalRange = moveRangeByOffset(range, offsetX, offsetY);
                    if (rangeUnitId && rangeSheetName) {
                        newToken = serializeRangeWithSpreadsheet(rangeUnitId, rangeSheetName, finalRange);
                    } else if (rangeSheetName) {
                        newToken = serializeRangeWithSheet(rangeSheetName, finalRange);
                    } else {
                        newToken = serializeRange(finalRange);
                    }
                } else {
                    newToken = ErrorType.ERROR;
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
            const currentUnit = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const currentSheet = currentUnit.getActiveSheet();
            const currentUnitId = currentUnit.getUnitId();
            const currentSheetId = currentSheet.getSheetId();

            const transformSequenceNodes = sequenceNodes?.map((node) => {
                if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                    const rangeInfo = rangeMap.get(node.token)!;
                    if ((rangeInfo.unitId !== currentUnitId) || (rangeInfo.subUnitId !== currentSheetId)) {
                        return node;
                    }

                    const newRange = handleDefaultRangeChangeWithEffectRefCommands(rangeInfo.range, params);
                    let newToken = '';

                    if (newRange) {
                        const offsetX = newRange.startColumn - rangeInfo.range.startColumn;
                        const offsetY = newRange.startRow - rangeInfo.range.startRow;
                        const finalRange = moveRangeByOffset(rangeInfo.range, offsetX, offsetY);
                        if (rangeInfo.unitId && rangeInfo.sheetName) {
                            newToken = serializeRangeWithSpreadsheet(rangeInfo.unitId, rangeInfo.sheetName, finalRange);
                        } else if (rangeInfo.sheetName) {
                            newToken = serializeRangeWithSheet(rangeInfo.sheetName, finalRange);
                        } else {
                            newToken = serializeRange(finalRange);
                        }
                    } else {
                        newToken = ErrorType.ERROR;
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

        const dependencyRanges: { unitId: string; subUnitId: string; ranges: IRange[] }[] = [];
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

                const offsetRanges = ranges.map((range) => ({
                    startRow: range.startRow - orginStartRow + currentStartRow,
                    endRow: range.endRow - orginStartRow + currentStartRow,
                    startColumn: range.startColumn - orginStartColumn + currentStartColumn,
                    endColumn: range.endColumn - orginStartColumn + currentStartColumn,
                }));

                dependencyRanges.push({
                    unitId: realUnitId,
                    subUnitId: realSheetId,
                    ranges: offsetRanges,
                });
            }
        });

        return dependencyRanges;
    }

    // eslint-disable-next-line max-lines-per-function
    registerRangeFormula(unitId: string, subUnitId: string, oldRanges: IRange[], formulas: string[], callback: RangeFormulaChangeCallback): IDisposable {
        const disposableCollection = new DisposableCollection();
        const formulaDeps = formulas.map((formula) => this._getFormulaDependcy(unitId, subUnitId, formula, oldRanges));

        // WTF!
        // eslint-disable-next-line max-lines-per-function
        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            const orginStartRow = oldRanges[0].startRow;
            const orginStartColumn = oldRanges[0].startColumn;
            const deps = [{ unitId, subUnitId, ranges: oldRanges }, ...formulaDeps.flat()];
            const matchedEffectedRanges: IRange[][] = [];
            const effectedRanges = getSeparateEffectedRangesOnCommand(this._injector, commandInfo);

            deps.forEach(({ unitId, subUnitId, ranges }) => {
                if (unitId === effectedRanges.unitId && subUnitId === effectedRanges.subUnitId) {
                    const intersectedRanges: IRange[] = [];
                    const currentStartRow = ranges[0].startRow;
                    const currentStartColumn = ranges[0].startColumn;
                    const offsetRow = currentStartRow - orginStartRow;
                    const offsetColumn = currentStartColumn - orginStartColumn;

                    effectedRanges.ranges.forEach((range) => {
                        const intersectedRange = ranges.map((r) => getIntersectRange(range, r)).filter(Boolean) as IRange[];
                        if (intersectedRange.length > 0) {
                            intersectedRanges.push(...intersectedRange);
                        }
                    });

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
            });

            if (matchedEffectedRanges.length > 0) {
                const ranges = Rectangle.splitIntoGrid([...matchedEffectedRanges.flat()]);
                const noEffectRanges = Rectangle.subtractMulti(oldRanges, ranges);

                const keyMap = new Map<string, { formulas: { newFormula: string; orginFormula: string }[]; range: IRange }[]>();
                ranges.forEach((range) => {
                    const currentRow = range.startRow;
                    const currentColumn = range.startColumn;
                    const offsetRow = currentRow - orginStartRow;
                    const offsetColumn = currentColumn - orginStartColumn;

                    const transformedFormulas = formulas.map((formula1) => {
                        const isFormula1FormulaString = isFormulaString(formula1);
                        const formula1String = isFormula1FormulaString ? this._lexerTreeBuilder.moveFormulaRefOffset(formula1!, offsetColumn, offsetRow) : formula1!;
                        const newFormula1 = isFormula1FormulaString ? this.transformFormulaByEffectCommand(unitId, subUnitId, formula1String, commandInfo) : formula1String;
                        const orginFormula1 = newFormula1 === formula1String ? formula1 : this._lexerTreeBuilder.moveFormulaRefOffset(newFormula1, -offsetColumn, -offsetRow);

                        return {
                            newFormula: newFormula1,
                            orginFormula: orginFormula1,
                        };
                    });

                    const item = {
                        formulas: transformedFormulas,
                        range,
                        key: transformedFormulas.map((item) => item.orginFormula).join('_'),
                    };

                    if (keyMap.has(item.key)) {
                        keyMap.get(item.key)!.push(item);
                    } else {
                        keyMap.set(item.key, [item]);
                    }
                });

                const originKey = formulas.map((item) => item).join('_');
                if (noEffectRanges.length > 0) {
                    const items = noEffectRanges.map((range) => ({
                        formulas: formulas.map((formula) => ({
                            newFormula: this._lexerTreeBuilder.moveFormulaRefOffset(formula, range.startColumn - orginStartColumn, range.startRow - orginStartRow),
                            orginFormula: formula,
                        })),
                        range,
                        key: originKey,
                    }));

                    items.forEach((item) => {
                        if (keyMap.has(item.key)) {
                            keyMap.get(item.key)!.push(item);
                        } else {
                            keyMap.set(item.key, [item]);
                        }
                    });
                }

                const res = Array.from(keyMap.keys()).map((key) => {
                    const ranges = keyMap.get(key)!.sort((a, b) => a.range.startRow - b.range.startRow || a.range.startColumn - b.range.startColumn);
                    const formulas = ranges[0].formulas.map((item) => item.newFormula);
                    const newRanges = Rectangle.mergeRanges(ranges.map((item) => handleCommonDefaultRangeChangeWithEffectRefCommands(item.range, commandInfo)).filter((range) => !!range).flat());
                    newRanges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);

                    return {
                        formulas,
                        ranges: newRanges,
                        originFormulas: ranges[0].formulas.map((item) => item.orginFormula),
                    };
                });

                return callback(res);
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
