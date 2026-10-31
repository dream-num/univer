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

import type { IMutationInfo, IRange } from '@univerjs/core';
import type { IClearSelectionAllCommandParams, IClearSelectionFormatCommandParams } from '@univerjs/sheets';
import type {
    IConditionalFormattingRuleConfig,
    IConditionFormattingRule,
    IDeleteConditionalRuleMutationParams,
    ISetConditionalRuleMutationParams,
} from '@univerjs/sheets-conditional-formatting';
import { Disposable, Inject, Injector, IUniverInstanceService } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import {
    ClearSelectionAllCommand,
    ClearSelectionFormatCommand,
    getSheetCommandTarget,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    CFRuleType,
    CFSubRuleType,
    ConditionalFormattingRangeIndexModel,
    ConditionalFormattingRangeTransformService,
    DeleteConditionalRuleMutation,
    DeleteConditionalRuleMutationUndoFactory,
    SetConditionalRuleMutation,
    setConditionalRuleMutationUndoFactory,
} from '@univerjs/sheets-conditional-formatting';

export class ConditionalFormattingClearController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsSelectionsService) private _selectionManagerService: SheetsSelectionsService,
        @Inject(ConditionalFormattingRangeIndexModel) private _conditionalFormattingRangeIndexModel: ConditionalFormattingRangeIndexModel

    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (commandInfo) => {
                const redos: IMutationInfo[] = [];
                const undos: IMutationInfo[] = [];
                const defaultV = { redos, undos };
                if ([ClearSelectionFormatCommand.id, ClearSelectionAllCommand.id].includes(commandInfo.id)) {
                    const params = commandInfo.params as IClearSelectionAllCommandParams | IClearSelectionFormatCommandParams | undefined;
                    const target = getSheetCommandTarget(this._univerInstanceService, params);
                    if (!target) {
                        return defaultV;
                    }
                    const ranges = params?.ranges ?? this._selectionManagerService.getCurrentSelections()?.map((s) => s.range);
                    if (!ranges?.length) {
                        return defaultV;
                    }
                    const { unitId, subUnitId } = target;

                    const allRules = this._conditionalFormattingRangeIndexModel.getRulesByRanges(unitId, subUnitId, ranges);
                    if (!allRules || !allRules.length) {
                        return defaultV;
                    }
                    const { redos: interceptRedos, undos: interceptUndos } = generateClearCfMutations(this._injector, allRules, ranges, unitId, subUnitId);
                    redos.push(...interceptRedos);
                    undos.push(...interceptUndos);
                }
                return defaultV;
            },
        }));

        this.disposeWithMe(this._sheetInterceptorService.interceptRanges({
            getMutations: ({ unitId, subUnitId, ranges }) => {
                const redos: IMutationInfo[] = [];
                const undos: IMutationInfo[] = [];
                const emptyInterceptorArr = { redos, undos };
                if (!ranges || !ranges.length) {
                    return emptyInterceptorArr;
                }
                const allRules = this._conditionalFormattingRangeIndexModel.getRulesByRanges(unitId, subUnitId, ranges);
                if (!allRules || !allRules.length) {
                    return emptyInterceptorArr;
                }
                const { redos: interceptRedos, undos: interceptUndos } = generateClearCfMutations(this._injector, allRules, ranges, unitId, subUnitId);
                redos.push(...interceptRedos);
                undos.push(...interceptUndos);

                return emptyInterceptorArr;
            },
        }));
    }
}

export function generateClearCfMutations(injector: Injector, allRules: IConditionFormattingRule<IConditionalFormattingRuleConfig>[], ranges: IRange[], unitId: string, subUnitId: string) {
    const redos: IMutationInfo[] = [];
    const undos: IMutationInfo[] = [];
    const rangeTransformService = injector.get(ConditionalFormattingRangeTransformService);
    allRules.forEach((rule) => {
        const mergeRanges = rangeTransformService.subtractRanges(rule.ranges, ranges);
        if (mergeRanges.length) {
            let nextConfig = rule.rule;
            if (rule.rule.type === CFRuleType.highlightCell && rule.rule.subType === CFSubRuleType.formula) {
                const topLeft = (items: IRange[]) => items.reduce((first, item) =>
                    item.startRow < first.startRow || (item.startRow === first.startRow && item.startColumn < first.startColumn) ? item : first);
                const previous = topLeft(rule.ranges);
                const current = topLeft(mergeRanges);
                const rowOffset = current.startRow - previous.startRow;
                const columnOffset = current.startColumn - previous.startColumn;
                if (rowOffset || columnOffset) {
                    const value = injector.get(LexerTreeBuilder).moveFormulaRefOffset(rule.rule.value, columnOffset, rowOffset);
                    nextConfig = { ...rule.rule, value };
                }
            }
            const redo: IMutationInfo<ISetConditionalRuleMutationParams> = {
                id: SetConditionalRuleMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    rule: { ...rule, ranges: mergeRanges, rule: nextConfig },
                },
            };
            const undo = setConditionalRuleMutationUndoFactory(injector, redo.params);
            redos.push(redo);
            undos.push(...undo);
        } else {
            const redo: IMutationInfo<IDeleteConditionalRuleMutationParams> = {
                id: DeleteConditionalRuleMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    cfId: rule.cfId,
                },
            };
            const undo = DeleteConditionalRuleMutationUndoFactory(injector, redo.params);
            redos.push(redo);
            undos.push(...undo);
        }
    });
    return { redos, undos };
}
