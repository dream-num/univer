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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import type { IAddConditionalRuleMutationParams, IConditionalFormattingRuleConfig, IConditionFormattingRule, IDeleteConditionalRuleMutationParams, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';
import type { IDiscreteRange, IPasteHookValueType } from '@univerjs/sheets-ui';
import {
    Disposable,
    Inject,
    Injector,
    IUniverInstanceService,
    ObjectMatrix,
    Range,
    Rectangle,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    createTopMatrixFromMatrix,
    findAllRectangle,
    rangeToDiscreteRange,
} from '@univerjs/sheets';
import { AddConditionalRuleMutation, AddConditionalRuleMutationUndoFactory, ConditionalFormattingRuleModel, ConditionalFormattingViewModel, DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory, SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '@univerjs/sheets-conditional-formatting';
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

export class ConditionalFormattingCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        matrix: ObjectMatrix<string[]>;
        info: {
            unitId: string;
            subUnitId: string;
            cfMap: Record<string, IConditionalFormattingRuleConfig>;
        };
    }>;

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
                onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                    const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                    const { range: copyRange } = pasteFrom || {};
                    const { range: pastedRange } = pasteTo;
                    return this._generateConditionalFormattingMutations(pastedRange, { copyType, pasteType, copyRange });
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
    private _generateConditionalFormattingMutations(
        pastedRange: IDiscreteRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IDiscreteRange;
            pasteType: IPasteHookValueType;
        }
    ) {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        if (!sheet) return { redos: [], undos: [] };

        const subUnitId = sheet.getSheetId();
        if (copyInfo.copyType === COPY_TYPE.CUT) {
            // This do not need to deal with clipping.
            // move range had handle this case .
            // to see cf.ref-range.controller.ts
            this._copyInfo = null;
            return { redos: [], undos: [] };
        }
        if (!this._copyInfo || !copyInfo.copyRange) {
            return { redos: [], undos: [] };
        }

        const specialPastes: IPasteHookValueType[] = [
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            PREDEFINED_HOOK_NAME.DEFAULT_PASTE,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_BESIDES_BORDER,
        ];

        if (
            !specialPastes.includes(
                copyInfo.pasteType
            )
        ) {
            return { redos: [], undos: [] };
        }

        const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyInfo.copyRange, pastedRange]);
        const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);
        const effectedConditionalFormattingRuleMatrix: Record<string, ObjectMatrix<1>> = {};
        Range.foreach(vPastedRange, (row, col) => {
            const { row: realRow, col: realCol } = mapFunc(row, col);
            const cellCfList = this._conditionalFormattingViewModel.getCellCfs(unitId, subUnitId, realRow, realCol);
            if (cellCfList) {
                cellCfList.forEach((item) => {
                    if (!effectedConditionalFormattingRuleMatrix[item.cfId]) {
                        const ruleMatrix = new ObjectMatrix<1>();
                        effectedConditionalFormattingRuleMatrix[item.cfId] = ruleMatrix;
                        const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, item.cfId);
                        rule?.ranges.forEach((range) => {
                            Range.foreach(range, (row, col) => {
                                ruleMatrix.setValue(row, col, 1);
                            });
                        });
                    }
                    effectedConditionalFormattingRuleMatrix[item.cfId].realDeleteValue(realRow, realCol);
                });
            }
        });

        const { matrix, info } = this._copyInfo;
        const waitAddRule: IConditionFormattingRule[] = [];
        let nextCfId = this._conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
        const cacheCfIdMap: Record<string, IConditionFormattingRule> = {};
        /**
         used to match the conditional formatting in the current worksheet with the same conditional formatting
         configuration in the copy range, and if this worksheet does not exist,
         a new cf is created based on the current worksheet.
         */
        const getCurrentSheetCfRule = (copyRangeCfId: string) => {
            if (cacheCfIdMap[copyRangeCfId]) {
                return cacheCfIdMap[copyRangeCfId];
            }
            const oldRule = info?.cfMap[copyRangeCfId];
            const targetRule = [...(this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) || []), ...waitAddRule].find((rule) => {
                return Tools.diffValue(rule.rule, oldRule);
            });
            if (targetRule) {
                cacheCfIdMap[copyRangeCfId] = targetRule;
                return targetRule;
            } else {
                const rule: IConditionFormattingRule = {
                    rule: oldRule,
                    cfId: nextCfId,
                    ranges: [],
                    stopIfTrue: false,
                };
                cacheCfIdMap[copyRangeCfId] = rule;
                waitAddRule.push(rule);
                nextCfId = `${Number(nextCfId) + 1}`;
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
                        if (!effectedConditionalFormattingRuleMatrix[cfId]) {
                            const rule = getCurrentSheetCfRule(cfId);
                            const ruleMatrix = new ObjectMatrix<1>();
                            effectedConditionalFormattingRuleMatrix[cfId] = ruleMatrix;
                            rule.ranges.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    ruleMatrix.setValue(row, col, 1);
                                });
                            });
                        }
                        effectedConditionalFormattingRuleMatrix[cfId].setValue(_row, _col, 1);
                    });
                });
        });
        const redos = [];
        const undos = [];
        for (const cfId in effectedConditionalFormattingRuleMatrix) {
            const matrix = effectedConditionalFormattingRuleMatrix[cfId];
            const ranges = findAllRectangle(createTopMatrixFromMatrix(matrix));
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
                const rule = getCurrentSheetCfRule(cfId);
                const addParams: IAddConditionalRuleMutationParams = {
                    unitId,
                    subUnitId,
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
