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

import type { IDisposable, IMutationInfo, IRange } from '@univerjs/core';
import type { IColorScale, IConditionFormattingRule, IDataBar, IFormulaHighlightCell, IIconSet } from '@univerjs/sheets-conditional-formatting';
import { Disposable, Inject, Injector, toDisposable, Tools } from '@univerjs/core';
import {
    AddConditionalRuleMutation,
    AddConditionalRuleMutationUndoFactory,
    CFRuleType,
    CFSubRuleType,
    CFValueType,
    ConditionalFormattingRuleModel,
    createCfId,
    DeleteConditionalRuleMutation,
    SetConditionalRuleMutation,
    setConditionalRuleMutationUndoFactory,
} from '@univerjs/sheets-conditional-formatting';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';

export class ConditionalFormattingFormulaRefRangeController extends Disposable {
    private _disposableMap: Map<string, IDisposable> = new Map();

    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(FormulaRefRangeService) private _formulaRefRangeService: FormulaRefRangeService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitID: string, subUnitId: string, cfId: string) {
        return `${unitID}_${subUnitId}_${cfId}`;
    }

    private _getRuleFormulas(rule: IConditionFormattingRule): string[] {
        const formulas: string[] = [];
        const ruleConfig = rule.rule;
        switch (ruleConfig.type) {
            case CFRuleType.highlightCell:
                if (ruleConfig.subType === CFSubRuleType.formula) {
                    formulas.push((ruleConfig as IFormulaHighlightCell).value);
                }
                break;
            case CFRuleType.dataBar: {
                const dataBar = ruleConfig as IDataBar;
                if (dataBar.config.min.type === CFValueType.formula) {
                    formulas.push(dataBar.config.min.value as string);
                }
                if (dataBar.config.max.type === CFValueType.formula) {
                    formulas.push(dataBar.config.max.value as string);
                }
                break;
            }
            case CFRuleType.colorScale: {
                const colorScale = ruleConfig as IColorScale;
                colorScale.config.forEach((item) => {
                    if (item.value.type === CFValueType.formula) {
                        formulas.push(item.value.value as string);
                    }
                });
                break;
            }
            case CFRuleType.iconSet: {
                const iconSet = ruleConfig as IIconSet;
                iconSet.config.forEach((item) => {
                    if (item.value.type === CFValueType.formula) {
                        formulas.push(item.value.value as string);
                    }
                });
                break;
            }
        }
        return formulas;
    }

    private _updateRuleFormulas(rule: IConditionFormattingRule, formulas: string[]): IConditionFormattingRule {
        const newRule = Tools.deepClone(rule);
        const ruleConfig = newRule.rule;
        let formulaIndex = 0;
        switch (ruleConfig.type) {
            case CFRuleType.highlightCell:
                if (ruleConfig.subType === CFSubRuleType.formula) {
                    (ruleConfig as IFormulaHighlightCell).value = formulas[formulaIndex++];
                }
                break;
            case CFRuleType.dataBar: {
                const dataBar = ruleConfig as IDataBar;
                if (dataBar.config.min.type === CFValueType.formula) {
                    dataBar.config.min.value = formulas[formulaIndex++];
                }
                if (dataBar.config.max.type === CFValueType.formula) {
                    dataBar.config.max.value = formulas[formulaIndex++];
                }
                break;
            }
            case CFRuleType.colorScale: {
                const colorScale = ruleConfig as IColorScale;
                colorScale.config.forEach((item) => {
                    if (item.value.type === CFValueType.formula) {
                        item.value.value = formulas[formulaIndex++];
                    }
                });
                break;
            }
            case CFRuleType.iconSet: {
                const iconSet = ruleConfig as IIconSet;
                iconSet.config.forEach((item) => {
                    if (item.value.type === CFValueType.formula) {
                        item.value.value = formulas[formulaIndex++];
                    }
                });
                break;
            }
        }
        return newRule;
    }

    register(unitId: string, subUnitId: string, rule: IConditionFormattingRule) {
        const oldRanges = rule.ranges;
        const oldFormulas = this._getRuleFormulas(rule);

        const disposable = this._formulaRefRangeService.registerRangeFormula(unitId, subUnitId, oldRanges, oldFormulas, (res: { formulas: string[]; ranges: IRange[] }[]) => {
            if (res.length === 0) {
                return {
                    undos: [{
                        id: AddConditionalRuleMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            rule,
                        },
                    }],
                    redos: [{
                        id: DeleteConditionalRuleMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            cfId: rule.cfId,
                        },
                    }],
                };
            }

            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];

            const first = res[0];
            const firstRule = this._updateRuleFormulas(rule, first.formulas);
            firstRule.ranges = first.ranges;

            redos.push({
                id: SetConditionalRuleMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    cfId: rule.cfId,
                    rule: firstRule,
                },
            });
            undos.push(...setConditionalRuleMutationUndoFactory(this._injector, {
                unitId,
                subUnitId,
                cfId: rule.cfId,
                rule: firstRule,
            }));

            for (let i = 1; i < res.length; i++) {
                const item = res[i];
                const newCfId = createCfId();
                const newRule = this._updateRuleFormulas(rule, item.formulas);
                newRule.cfId = newCfId;
                newRule.ranges = item.ranges;

                redos.push({
                    id: AddConditionalRuleMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        rule: newRule,
                    },
                });
                undos.push(AddConditionalRuleMutationUndoFactory(this._injector, {
                    unitId,
                    subUnitId,
                    rule: newRule,
                }));
            }

            return {
                undos,
                redos,
            };
        });

        const id = this._getIdWithUnitId(unitId, subUnitId, rule.cfId);
        this._disposableMap.set(id, disposable);
    }

    private _initRefRange() {
        const allRules = this._conditionalFormattingRuleModel.getAll();
        for (const [unitId, subUnitMap] of allRules) {
            for (const [subUnitId, rules] of subUnitMap) {
                for (const rule of rules) {
                    this.register(unitId, subUnitId, rule);
                }
            }
        }

        this.disposeWithMe(
            this._conditionalFormattingRuleModel.$ruleChange.subscribe((option) => {
                const { unitId, subUnitId, rule } = option;
                switch (option.type) {
                    case 'add': {
                        this.register(unitId, subUnitId, rule);
                        break;
                    }
                    case 'delete': {
                        const id = this._getIdWithUnitId(unitId, subUnitId, rule.cfId);
                        const disposable = this._disposableMap.get(id);
                        if (disposable) {
                            disposable.dispose();
                            this._disposableMap.delete(id);
                        }
                        break;
                    }
                    case 'set': {
                        const id = this._getIdWithUnitId(unitId, subUnitId, rule.cfId);
                        const disposable = this._disposableMap.get(id);
                        if (disposable) {
                            disposable.dispose();
                            this._disposableMap.delete(id);
                        }
                        this.register(unitId, subUnitId, rule);
                        break;
                    }
                }
            })
        );

        this.disposeWithMe(toDisposable(() => {
            this._disposableMap.forEach((item) => {
                item.dispose();
            });
            this._disposableMap.clear();
        }));
    }
}
