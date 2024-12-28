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
import type { EffectRefRangeParams } from '@univerjs/sheets';
import type { IColorScale, IConditionFormattingRule, IDataBar, IDeleteConditionalRuleMutationParams, IFormulaHighlightCell, IIconSet, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';
import { Disposable, Inject, Injector, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import { CFRuleType, CFSubRuleType, CFValueType, ConditionalFormattingRuleModel, DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, isRangesEqual, SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '@univerjs/sheets-conditional-formatting';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';

interface ISetConditionalRuleMutationParamsRedo extends ISetConditionalRuleMutationParams {
    payload: {
        newRanges?: IRange[];
        newFormulaString?: string;
        type?: CFRuleType;
        valueTypeOrIndex?: string | number;
    };
}

export class SheetsCfRefRangeController extends Disposable {
    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(RefRangeService) private _refRangeService: RefRangeService,
        @Inject(FormulaRefRangeService) private _formulaRefRangeService: FormulaRefRangeService
    ) {
        super();

        this._initRefRange();
        this._initMergeRedo();
        this._initMergeUndo();
    }

    private _initRefRange() {
        const disposableMap: Map<string, () => void> = new Map();
        const getCfIdWithUnitId = (unitID: string, subUnitId: string, cfId: string) => `${unitID}_${subUnitId}_${cfId}`;
        const register = (unitId: string, subUnitId: string, rule: IConditionFormattingRule) => {
            const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
                const oldRanges = [...rule.ranges];
                const resultRanges = oldRanges.map((range) => {
                    return handleDefaultRangeChangeWithEffectRefCommands(range, commandInfo) as IRange;
                }).filter((range) => !!range);
                const isEqual = isRangesEqual(resultRanges, oldRanges);
                if (isEqual) {
                    return { redos: [], undos: [] };
                }
                if (resultRanges.length) {
                    const redoParams: ISetConditionalRuleMutationParamsRedo = { unitId, subUnitId, rule, payload: { newRanges: resultRanges } };
                    const redos = [{ id: SetConditionalRuleMutation.id, params: redoParams }];
                    const undos = setConditionalRuleMutationUndoFactory(this._injector, redoParams);
                    return { redos, undos };
                } else {
                    const redoParams: IDeleteConditionalRuleMutationParams = { unitId, subUnitId, cfId: rule.cfId };
                    const redos = [{ id: DeleteConditionalRuleMutation.id, params: redoParams }];
                    const undos = DeleteConditionalRuleMutationUndoFactory(this._injector, redoParams);
                    return { redos, undos };
                }
            };

            const disposeList: (() => void)[] = [];
            rule.ranges.forEach((range) => {
                const disposable = this._refRangeService.registerRefRange(range, handleRangeChange);
                disposeList.push(() => disposable.dispose());
            });
            // Conditional formatting formulas also need to monitor changes in the reference range
            this._registerFormula(unitId, subUnitId, rule, disposeList);
            disposableMap.set(getCfIdWithUnitId(unitId, subUnitId, rule.cfId), () => disposeList.forEach((dispose) => dispose()));
        };

        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.subscribe((option) => {
            const { unitId, subUnitId, rule } = option;
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            if (option.unitId !== workbook.getUnitId() || option.subUnitId !== worksheet?.getSheetId()) {
                return;
            }
            switch (option.type) {
                case 'add':{
                    register(option.unitId, option.subUnitId, option.rule);
                    break;
                }
                case 'delete':{
                    const dispose = disposableMap.get(getCfIdWithUnitId(unitId, subUnitId, rule.cfId));
                    dispose && dispose();
                    break;
                }
                case 'set':{
                    const dispose = disposableMap.get(getCfIdWithUnitId(unitId, subUnitId, rule.cfId));
                    dispose && dispose();
                            // and to add
                    register(option.unitId, option.subUnitId, option.rule);
                }
            }
        }));

        this.disposeWithMe(toDisposable(() => {
            disposableMap.forEach((item) => {
                item();
            });
            disposableMap.clear();
        }));
    }

    // eslint-disable-next-line max-lines-per-function
    private _registerFormula(unitId: string, subUnitId: string, rule: IConditionFormattingRule, disposeList: (() => void)[]) {
        // highlightCell custom formula
        if ('subType' in rule.rule && rule.rule.subType === CFSubRuleType.formula) {
            const disposable = this._formulaRefRangeService.registerFormula(
                unitId,
                subUnitId,
                rule.rule.value,
                (newFormulaString) => this._handleFormulaChange(
                    newFormulaString,
                    (rule.rule as IFormulaHighlightCell).value,
                    unitId,
                    subUnitId,
                    rule,
                    CFRuleType.highlightCell
                )
            );
            disposeList.push(() => disposable.dispose());
        }

        // dataBar value formula
        if (rule.rule.type === CFRuleType.dataBar) {
            if (rule.rule.config.min.type === CFValueType.formula) {
                const disposable = this._formulaRefRangeService.registerFormula(
                    unitId,
                    subUnitId,
                    rule.rule.config.min.value as string,
                    (newFormulaString) => this._handleFormulaChange(
                        newFormulaString,
                        (rule.rule as IDataBar).config.min.value as string,
                        unitId,
                        subUnitId,
                        rule,
                        CFRuleType.dataBar,
                        'min'
                    )
                );
                disposeList.push(() => disposable.dispose());
            }

            if (rule.rule.config.max.type === CFValueType.formula) {
                const disposable = this._formulaRefRangeService.registerFormula(
                    unitId,
                    subUnitId,
                    rule.rule.config.max.value as string,
                    (newFormulaString) => this._handleFormulaChange(
                        newFormulaString,
                        (rule.rule as IDataBar).config.max.value as string,
                        unitId,
                        subUnitId,
                        rule,
                        CFRuleType.dataBar,
                        'max'
                    )
                );
                disposeList.push(() => disposable.dispose());
            }
        }

        // colorScale value formula
        if (rule.rule.type === CFRuleType.colorScale) {
            rule.rule.config.forEach((item) => {
                if (item.value.type === CFValueType.formula) {
                    const disposable = this._formulaRefRangeService.registerFormula(
                        unitId,
                        subUnitId,
                        item.value.value as string,
                        (newFormulaString) => this._handleFormulaChange(
                            newFormulaString,
                            item.value.value as string,
                            unitId,
                            subUnitId,
                            rule,
                            CFRuleType.colorScale,
                            item.index
                        )
                    );
                    disposeList.push(() => disposable.dispose());
                }
            });
        }

        // iconSet value formula
        if (rule.rule.type === CFRuleType.iconSet) {
            rule.rule.config.forEach((item) => {
                if (item.value.type === CFValueType.formula) {
                    const disposable = this._formulaRefRangeService.registerFormula(
                        unitId,
                        subUnitId,
                        item.value.value as string,
                        (newFormulaString) => this._handleFormulaChange(
                            newFormulaString,
                            item.value.value as string,
                            unitId,
                            subUnitId,
                            rule,
                            CFRuleType.iconSet,
                            item.iconId
                        )
                    );
                    disposeList.push(() => disposable.dispose());
                }
            });
        }
    }

    private _handleFormulaChange(
        newFormulaString: string,
        oldFormulaString: string,
        unitId: string,
        subUnitId: string,
        rule: IConditionFormattingRule,
        type: CFRuleType,
        valueTypeOrIndex?: string | number
    ) {
        if (oldFormulaString === newFormulaString) {
            return { redos: [], undos: [] };
        }

        const redoParams: ISetConditionalRuleMutationParams & {
            payload: {
                newFormulaString: string;
                type: CFRuleType;
                valueTypeOrIndex?: string | number;
            };
        } = {
            unitId,
            subUnitId,
            rule,
            payload: {
                newFormulaString,
                type,
                valueTypeOrIndex,
            },
        };
        const redos = [{ id: SetConditionalRuleMutation.id, params: redoParams }];
        const undos = setConditionalRuleMutationUndoFactory(this._injector, redoParams);
        return { redos, undos };
    }

    private _initMergeRedo() {
        this._refRangeService.interceptor.intercept(this._refRangeService.interceptor.getInterceptPoints().MERGE_REDO, {
            priority: 100,
            handler: (list, _c, next) => {
                const redo = list?.filter((item) => item.id === SetConditionalRuleMutation.id) || [];
                const result = list?.filter((item) => item.id !== SetConditionalRuleMutation.id) || [];

                if (redo.length) {
                    // merge redo with the same cfId
                    const redoMap: Record<string, ISetConditionalRuleMutationParamsRedo[]> = {};
                    redo.forEach((item) => {
                        const { unitId, subUnitId, rule: { cfId } } = item.params as ISetConditionalRuleMutationParamsRedo;
                        if (!redoMap[`${unitId}_${subUnitId}_${cfId}`]) {
                            redoMap[`${unitId}_${subUnitId}_${cfId}`] = [];
                        }
                        redoMap[`${unitId}_${subUnitId}_${cfId}`].push(item.params as ISetConditionalRuleMutationParamsRedo);
                    });
                    Object.values(redoMap).forEach((paramsList) => {
                        result.push({
                            id: SetConditionalRuleMutation.id,
                            params: paramsList.reduce((pre, cur) => {
                                const newRule = { ...pre };
                                if (cur.payload.newRanges) {
                                    newRule.rule.ranges = cur.payload.newRanges;
                                }
                                if (cur.payload.newFormulaString) {
                                    if (cur.payload.type === CFRuleType.highlightCell) {
                                        (newRule.rule.rule as IFormulaHighlightCell).value = cur.payload.newFormulaString;
                                    }
                                    if (cur.payload.type === CFRuleType.dataBar) {
                                        if (cur.payload.valueTypeOrIndex === 'min') {
                                            (newRule.rule.rule as IDataBar).config.min.value = cur.payload.newFormulaString;
                                        }
                                        if (cur.payload.valueTypeOrIndex === 'max') {
                                            (newRule.rule.rule as IDataBar).config.max.value = cur.payload.newFormulaString;
                                        }
                                    }
                                    if (cur.payload.type === CFRuleType.colorScale) {
                                        (newRule.rule.rule as IColorScale).config.map((item) => {
                                            if (item.index === cur.payload.valueTypeOrIndex) {
                                                item.value.value = cur.payload.newFormulaString;
                                            }
                                            return item;
                                        });
                                    }
                                    if (cur.payload.type === CFRuleType.iconSet) {
                                        (newRule.rule.rule as IIconSet).config.map((item) => {
                                            if (item.iconId === cur.payload.valueTypeOrIndex) {
                                                item.value.value = cur.payload.newFormulaString;
                                            }
                                            return item;
                                        });
                                    }
                                }
                                return newRule;
                            }),
                        });
                    });
                }

                return next(result);
            },
        });
    }

    private _initMergeUndo() {
        this._refRangeService.interceptor.intercept(this._refRangeService.interceptor.getInterceptPoints().MERGE_UNDO, {
            priority: 100,
            handler: (list, _c, next) => {
                const undo = list?.filter((item) => item.id === SetConditionalRuleMutation.id) || [];
                const result = list?.filter((item) => item.id !== SetConditionalRuleMutation.id) || [];

                if (undo.length) {
                    // merge undo with the same cfId
                    const undoMap: Record<string, ISetConditionalRuleMutationParams[]> = {};
                    undo.forEach((item) => {
                        const { unitId, subUnitId, rule: { cfId } } = item.params as ISetConditionalRuleMutationParams;
                        if (!undoMap[`${unitId}_${subUnitId}_${cfId}`]) {
                            undoMap[`${unitId}_${subUnitId}_${cfId}`] = [];
                        }
                        undoMap[`${unitId}_${subUnitId}_${cfId}`].push(item.params as ISetConditionalRuleMutationParams);
                    });
                    Object.values(undoMap).forEach((paramsList) => {
                        result.push({
                            id: SetConditionalRuleMutation.id,
                            params: paramsList[0],
                        });
                    });
                }

                return next(result);
            },

        });
    }
}
