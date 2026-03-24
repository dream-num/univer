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

import type { IRange, Nullable } from '@univerjs/core';
import type { IAddConditionalRuleMutationParams, IConditionalFormattingRuleConfig, IConditionFormattingRule, IDeleteConditionalRuleMutationParams, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';
import type { ICopyPastePayload, IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import {
    Disposable,
    Inject,
    Injector,
    IUniverInstanceService,
    ObjectMatrix,
    Range,
    Rectangle,
    Tools,
} from '@univerjs/core';
import {
    createTopMatrixFromMatrix,
    findAllRectangle,
    getSheetCommandTarget,
    rangeToDiscreteRange,
} from '@univerjs/sheets';
import { AddConditionalRuleMutation, AddConditionalRuleMutationUndoFactory, ConditionalFormattingRuleModel, ConditionalFormattingViewModel, DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory, SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '@univerjs/sheets-conditional-formatting';
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

interface ICopyInfoType {
    matrix: ObjectMatrix<string[]>;
    info: {
        unitId: string;
        subUnitId: string;
        cfMap: Record<string, IConditionalFormattingRuleConfig>;
    };
}

const specialPastes: IPasteHookValueType[] = [
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
    PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_BESIDES_BORDER,
];

export class ConditionalFormattingCopyPasteController extends Disposable {
    private _copyInfo: Nullable<ICopyInfoType>;

    constructor(
        @Inject(ISheetClipboardService) private _sheetClipboardService: ISheetClipboardService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initClipboardHook();
    }

    private _initClipboardHook() {
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
                onBeforeCopy: (unitId, subUnitId, range) => this._collectConditionalRule(unitId, subUnitId, range),
                onPasteCells: (pasteFrom, pasteTo, _data, payload) => {
                    // If pasteFrom or copyInfo is null, it means the copy from outside of Univer, so not need to handle the conditional formatting, just return empty mutations.
                    if (!pasteFrom || !this._copyInfo || !specialPastes.includes(payload.pasteType)) {
                        return { redos: [], undos: [] };
                    }
                    return this._generateConditionalFormattingMutations(pasteFrom, pasteTo, payload);
                },
            })
        );
    }

    private _collectConditionalRule(unitId: string, subUnitId: string, range: IRange) {
        const matrix = new ObjectMatrix<string[]>();
        const cfMap: Record<string, IConditionalFormattingRuleConfig> = {};
        this._copyInfo = {
            matrix,
            info: {
                unitId,
                subUnitId,
                cfMap,
            },
        };

        const discreteRange = this._injector.invoke((accessor) => {
            return rangeToDiscreteRange(range, accessor, unitId, subUnitId);
        });
        if (!discreteRange) {
            return;
        }
        const { rows, cols } = discreteRange;
        const cfIdSet: Set<string> = new Set();
        rows.forEach((row, rowIndex) => {
            cols.forEach((col, colIndex) => {
                const cellCfList = this._conditionalFormattingViewModel.getCellCfs(unitId, subUnitId, row, col);
                if (!cellCfList) {
                    return;
                }
                cellCfList.forEach((item) => cfIdSet.add(item.cfId));
                matrix.setValue(rowIndex, colIndex, cellCfList.map((item) => item.cfId));
            });
        });
        cfIdSet.forEach((cfId) => {
            const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
            if (rule) {
                cfMap[cfId] = rule.rule;
            }
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _generateConditionalFormattingMutations(pasteFrom: ISheetDiscreteRangeLocation, pasteTo: ISheetDiscreteRangeLocation, payload: ICopyPastePayload) {
        const { unitId: copyUnitId, subUnitId: copySubUnitId, range: copyRange } = pasteFrom;
        const { unitId: pastedUnitId, subUnitId: pastedSubUnitId, range: pastedRange } = pasteTo;
        const { copyType = COPY_TYPE.COPY } = payload;

        const target = getSheetCommandTarget(this._univerInstanceService, { unitId: pastedUnitId, subUnitId: pastedSubUnitId });
        if (!target) {
            return { redos: [], undos: [] };
        }

        // If it is cut and paste in the same worksheet, do not need to handle the conditional formatting, because the move range had handle the ref range of conditional formatting, to see cf-formula-ref-range.controller.ts.
        if (copyType === COPY_TYPE.CUT && pastedUnitId === copyUnitId && pastedSubUnitId === copySubUnitId) {
            this._copyInfo = null;
            return { redos: [], undos: [] };
        }

        const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);
        const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);
        const effectedConditionalFormattingRuleMatrix: Record<string, {
            unitId: string;
            subUnitId: string;
            ruleMatrix: ObjectMatrix<1>;
        }> = {};

        // 1. delete the conditional formatting rules in the pasted range.
        Range.foreach(vPastedRange, (row, col) => {
            const { row: realRow, col: realCol } = mapFunc(row, col);
            const cellCfList = this._conditionalFormattingViewModel.getCellCfs(pastedUnitId, pastedSubUnitId, realRow, realCol);
            if (cellCfList) {
                cellCfList.forEach((item) => {
                    if (!effectedConditionalFormattingRuleMatrix[item.cfId]) {
                        const ruleMatrix = new ObjectMatrix<1>();
                        effectedConditionalFormattingRuleMatrix[item.cfId] = {
                            unitId: pastedUnitId,
                            subUnitId: pastedSubUnitId,
                            ruleMatrix,
                        };
                        const rule = this._conditionalFormattingRuleModel.getRule(pastedUnitId, pastedSubUnitId, item.cfId);
                        rule?.ranges.forEach((range) => {
                            Range.foreach(range, (row, col) => {
                                ruleMatrix.setValue(row, col, 1);
                            });
                        });
                    }
                    effectedConditionalFormattingRuleMatrix[item.cfId].ruleMatrix.realDeleteValue(realRow, realCol);
                });
            }
        });

        // 2. if it is cut from another worksheet, need to delete the conditional formatting rules in the copy range.
        if (copyType === COPY_TYPE.CUT && (pastedUnitId !== copyUnitId || pastedSubUnitId !== copySubUnitId)) {
            Range.foreach(vCopyRange, (row, col) => {
                const { row: realRow, col: realCol } = mapFunc(row, col);
                const cellCfList = this._conditionalFormattingViewModel.getCellCfs(copyUnitId, copySubUnitId, realRow, realCol);
                if (cellCfList) {
                    cellCfList.forEach((item) => {
                        if (!effectedConditionalFormattingRuleMatrix[item.cfId]) {
                            const ruleMatrix = new ObjectMatrix<1>();
                            effectedConditionalFormattingRuleMatrix[item.cfId] = {
                                unitId: copyUnitId,
                                subUnitId: copySubUnitId,
                                ruleMatrix,
                            };
                            const rule = this._conditionalFormattingRuleModel.getRule(copyUnitId, copySubUnitId, item.cfId);
                            rule?.ranges.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    ruleMatrix.setValue(row, col, 1);
                                });
                            });
                        }
                        effectedConditionalFormattingRuleMatrix[item.cfId].ruleMatrix.realDeleteValue(realRow, realCol);
                    });
                }
            });
        }

        const { matrix, info } = this._copyInfo as ICopyInfoType;
        const waitAddRule: IConditionFormattingRule[] = [];
        const cacheCfIdMap: Record<string, IConditionFormattingRule> = {};

        // 3. generate the new conditional formatting rules based on the copy range's conditional formatting rules and the paste position.
        const getCurrentSheetCfRule = (copyRangeCfId: string) => {
            const oldRule = info?.cfMap[copyRangeCfId];
            const targetRule = [...(this._conditionalFormattingRuleModel.getSubunitRules(pastedUnitId, pastedSubUnitId) || []), ...waitAddRule].find((rule) => {
                return Tools.diffValue(rule.rule, oldRule);
            });

            if (targetRule) {
                cacheCfIdMap[copyRangeCfId] = targetRule;
                return targetRule;
            } else {
                const rule: IConditionFormattingRule = {
                    rule: oldRule,
                    cfId: this._conditionalFormattingRuleModel.createCfId(pastedUnitId, pastedSubUnitId),
                    ranges: [],
                    stopIfTrue: false,
                };
                cacheCfIdMap[copyRangeCfId] = rule;
                waitAddRule.push(rule);
                return rule;
            }
        };

        repeatRange.forEach((item) => {
            matrix &&
                matrix.forValue((row, col, copyRangeCfIdList) => {
                    const range = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            endRow: row,
                            startColumn: col,
                            endColumn: col,
                        },
                        item.startRange
                    );

                    const { row: _row, col: _col } = mapFunc(range.startRow, range.startColumn);

                    copyRangeCfIdList.forEach((cfId) => {
                        const rule = cacheCfIdMap[cfId] || getCurrentSheetCfRule(cfId);
                        if (!effectedConditionalFormattingRuleMatrix[rule.cfId]) {
                            const ruleMatrix = new ObjectMatrix<1>();
                            effectedConditionalFormattingRuleMatrix[rule.cfId] = {
                                unitId: pastedUnitId,
                                subUnitId: pastedSubUnitId,
                                ruleMatrix,
                            };
                            rule.ranges.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    ruleMatrix.setValue(row, col, 1);
                                });
                            });
                        }
                        effectedConditionalFormattingRuleMatrix[rule.cfId].ruleMatrix.setValue(_row, _col, 1);
                    });
                });
        });

        const redos = [];
        const undos = [];

        for (const cfId in effectedConditionalFormattingRuleMatrix) {
            const { unitId, subUnitId, ruleMatrix } = effectedConditionalFormattingRuleMatrix[cfId];
            const ranges = findAllRectangle(createTopMatrixFromMatrix(ruleMatrix));

            if (!ranges.length) {
                const deleteParams: IDeleteConditionalRuleMutationParams = {
                    unitId,
                    subUnitId,
                    cfId,
                };
                redos.push({ id: DeleteConditionalRuleMutation.id, params: deleteParams });
                undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, deleteParams));
            }

            if (waitAddRule.some((rule) => rule.cfId === cfId)) {
                const rule = waitAddRule.find((rule) => rule.cfId === cfId) as IConditionFormattingRule;
                const addParams: IAddConditionalRuleMutationParams = {
                    unitId: pastedUnitId,
                    subUnitId: pastedSubUnitId,
                    rule: { ...rule, ranges },
                };
                redos.push({ id: AddConditionalRuleMutation.id, params: addParams });
                undos.push(AddConditionalRuleMutationUndoFactory(this._injector, addParams));
            } else {
                const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                if (!rule) {
                    continue;
                }
                const setParams: ISetConditionalRuleMutationParams = {
                    unitId,
                    subUnitId,
                    rule: { ...rule, ranges },
                };
                redos.push({ id: SetConditionalRuleMutation.id, params: setParams });
                undos.push(...setConditionalRuleMutationUndoFactory(this._injector, setParams));
            }
        }

        return {
            redos,
            undos,
        };
    }
}
