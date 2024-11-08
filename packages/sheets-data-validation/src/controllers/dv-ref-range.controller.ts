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

import type { IMutationInfo, IRange, ISheetDataValidationRule, Workbook } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { Disposable, generateRandomId, getIntersectRange, Inject, Injector, isFormulaString, IUniverInstanceService, Rectangle, toDisposable } from '@univerjs/core';
import { AddDataValidationMutation, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { deserializeRangeWithSheetWithCache, LexerTreeBuilder, sequenceNodeType } from '@univerjs/engine-formula';
import { getSeparateEffectedRangesOnCommand, handleCommonDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';

export class DataValidationRefRangeController extends Disposable {
    private _disposableMap: Map<string, Set<() => void>> = new Map();

    constructor(
        @Inject(SheetDataValidationModel) private _dataValidationModel: SheetDataValidationModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(RefRangeService) private _refRangeService: RefRangeService,
        @Inject(LexerTreeBuilder) private _lexerTreeBuilder: LexerTreeBuilder,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(FormulaRefRangeService) private _formulaRefRangeService: FormulaRefRangeService
    ) {
        super();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitID: string, subUnitId: string, ruleId: string) {
        return `${unitID}_${subUnitId}_${ruleId}`;
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

    registerRule = (unitId: string, subUnitId: string, rule: ISheetDataValidationRule) => {
        this.register(unitId, subUnitId, rule);
    };

    // eslint-disable-next-line max-lines-per-function
    register(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const disposeList: (() => void)[] = [];

        const formula1 = rule.formula1;
        const formula2 = rule.formula2;
        const formula1Deps = this._getFormulaDependcy(unitId, subUnitId, formula1, rule.ranges);
        const formula2Deps = this._getFormulaDependcy(unitId, subUnitId, formula2, rule.ranges);

        // WTF!
        // eslint-disable-next-line max-lines-per-function
        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            const oldRanges = [...rule.ranges];
            const orginStartRow = oldRanges[0].startRow;
            const orginStartColumn = oldRanges[0].startColumn;
            const deps = [{ unitId, subUnitId, ranges: oldRanges }, ...formula1Deps, ...formula2Deps];
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

                const keyMap = new Map<string, { formula1: string; formula2: string; range: IRange }[]>();
                ranges.forEach((range) => {
                    const currentRow = range.startRow;
                    const currentColumn = range.startColumn;
                    const offsetRow = currentRow - orginStartRow;
                    const offsetColumn = currentColumn - orginStartColumn;
                    const isFormula1FormulaString = isFormulaString(formula1);
                    const isFormula2FormulaString = isFormulaString(formula2);
                    const formula1String = isFormula1FormulaString ? this._lexerTreeBuilder.moveFormulaRefOffset(formula1!, offsetColumn, offsetRow) : formula1!;
                    const formula2String = isFormula2FormulaString ? this._lexerTreeBuilder.moveFormulaRefOffset(formula2!, offsetColumn, offsetRow) : formula2!;
                    const newFormula1 = isFormula1FormulaString ? this._formulaRefRangeService.transformFormulaByEffectCommand(unitId, subUnitId, formula1String, commandInfo) : formula1String;
                    const newFormula2 = isFormula2FormulaString ? this._formulaRefRangeService.transformFormulaByEffectCommand(unitId, subUnitId, formula2String, commandInfo) : formula2String;

                    const orginFormula1 = newFormula1 === formula1String ? formula1 : this._lexerTreeBuilder.moveFormulaRefOffset(newFormula1, -offsetColumn, -offsetRow);
                    const orginFormula2 = newFormula2 === formula2String ? formula2 : this._lexerTreeBuilder.moveFormulaRefOffset(newFormula2, -offsetColumn, -offsetRow);

                    const item = {
                        formula1: newFormula1,
                        formula2: newFormula2,
                        range,
                        key: `${orginFormula1}_${orginFormula2}`,
                    };

                    if (keyMap.has(item.key)) {
                        keyMap.get(item.key)!.push(item);
                    } else {
                        keyMap.set(item.key, [item]);
                    }
                });

                const redos: IMutationInfo[] = [];
                const undos: IMutationInfo[] = [];
                if (noEffectRanges.length > 0) {
                    redos.push({
                        id: UpdateDataValidationMutation.id,
                        params: {
                            ruleId: rule.uid,
                            payload: {
                                type: UpdateRuleType.RANGE,
                                payload: noEffectRanges,
                            },
                            unitId,
                            subUnitId,
                        } as IUpdateDataValidationMutationParams,
                    });

                    undos.push({
                        id: UpdateDataValidationMutation.id,
                        params: {
                            ruleId: rule.uid,
                            payload: {
                                type: UpdateRuleType.RANGE,
                                payload: [...oldRanges],
                            },
                            unitId,
                            subUnitId,
                        } as IUpdateDataValidationMutationParams,
                    });
                } else {
                    redos.push({
                        id: RemoveDataValidationMutation.id,
                        params: {
                            ruleId: rule.uid,
                            unitId,
                            subUnitId,
                        } as IRemoveDataValidationMutationParams,
                    });

                    undos.push({
                        id: AddDataValidationMutation.id,
                        params: {
                            rule,
                            unitId,
                            subUnitId,
                        } as IAddDataValidationMutationParams,
                    });
                }

                Array.from(keyMap.keys()).forEach((key) => {
                    const ranges = keyMap.get(key)!.sort((a, b) => a.range.startRow - b.range.startRow || a.range.startColumn - b.range.startColumn);
                    const newRanges = Rectangle.mergeRanges(ranges.map((item) => handleCommonDefaultRangeChangeWithEffectRefCommands(item.range, commandInfo)).filter((range) => !!range).flat());
                    newRanges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);

                    if (newRanges.length) {
                        const newId = generateRandomId();

                        redos.push({
                            id: AddDataValidationMutation.id,
                            params: {
                                rule: {
                                    ...rule,
                                    formula1: ranges[0].formula1,
                                    formula2: ranges[0].formula2,
                                    ranges: newRanges,
                                    uid: newId,
                                },
                                unitId,
                                subUnitId,
                            } as IAddDataValidationMutationParams,
                        });

                        undos.push({
                            id: RemoveDataValidationMutation.id,
                            params: {
                                ruleId: newId,
                                unitId,
                                subUnitId,
                            } as IRemoveDataValidationMutationParams,
                        });
                    }
                });

                return {
                    undos,
                    redos,
                };
            }

            return {
                undos: [],
                redos: [],
            };
        };

        rule.ranges.forEach((range) => {
            const disposable = this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId);
            disposeList.push(() => disposable.dispose());
        });

        [...formula1Deps, ...formula2Deps].forEach(({ unitId, subUnitId, ranges }) => {
            ranges.forEach((range) => {
                const disposable = this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId);
                disposeList.push(() => disposable.dispose());
            });
        });

        const id = this._getIdWithUnitId(unitId, subUnitId, rule.uid);
        const current = this._disposableMap.get(id) ?? new Set();
        current.add(() => disposeList.forEach((dispose) => dispose()));
        this._disposableMap.set(id, current);
    };

    private _initRefRange() {
        const allRules = this._dataValidationModel.getAll();
        for (const [unitId, subUnitMap] of allRules) {
            for (const [subUnitId, rules] of subUnitMap) {
                for (const rule of rules) {
                    this.registerRule(unitId, subUnitId, rule);
                }
            }
        }

        this.disposeWithMe(
            this._dataValidationModel.ruleChange$.subscribe((option) => {
                const { unitId, subUnitId, rule } = option;
                switch (option.type) {
                    case 'add': {
                        const rule = option.rule!;
                        this.registerRule(option.unitId, option.subUnitId, rule);
                        break;
                    }
                    case 'remove': {
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                        if (disposeSet) {
                            disposeSet.forEach((dispose) => dispose());
                        }
                        break;
                    }
                    case 'update': {
                        const rule = option.rule!;
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                        if (disposeSet) {
                            disposeSet.forEach((dispose) => dispose());
                        }
                        this.registerRule(option.unitId, option.subUnitId, rule);
                        break;
                    }
                }
            })
        );

        this.disposeWithMe(toDisposable(() => {
            this._disposableMap.forEach((item) => {
                item.forEach((dispose) => dispose());
            });
            this._disposableMap.clear();
        }));
    }
}
