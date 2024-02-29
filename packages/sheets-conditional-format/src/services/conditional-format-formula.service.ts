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

import type { ICellData, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, RefAlias, Tools } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { IActiveDirtyManagerService } from '@univerjs/sheets-formula';
import { SetFormulaCalculationResultMutation, SetOtherFormulaMutation } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';
import { bufferTime, filter, map } from 'rxjs/operators';
import type { IConditionalFormatFormulaMarkDirtyParams } from '../commands/mutations/formula-mark-dirty.mutation';
import { conditionalFormatFormulaMarkDirty } from '../commands/mutations/formula-mark-dirty.mutation';
import { ConditionalFormatViewModel } from '../models/conditional-format-view-model';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';

// eslint-disable-next-line ts/consistent-type-definitions
type IFormulaItem = {
    formulaText: string;cfId: string;result?: boolean | number | string;status: FormulaResultStatus;count: number;formulaId: string;
};
export enum FormulaResultStatus {
    NOT_REGISTER = 1,
    SUCCESS,
    WAIT,
    ERROR,
}

const getResultFromFormula = (formulaResult: Nullable<ICellData>[][]) => {
    const v = formulaResult && formulaResult[0] && formulaResult[0][0];
    return v ? v.v : false;
};

export class ConditionalFormatFormulaService extends Disposable {
    private _formulaMap: Map<string, Map<string, RefAlias<IFormulaItem, 'formulaId' | 'formulaText'>>> = new Map();

    private _formulaChange$ = new Subject<{
        unitId: string; subUnitId: string; cfId: string; formulaText: string;formulaId: string;
    }>();

    public formulaChange$ = this._formulaChange$.asObservable();

    constructor(
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(IActiveDirtyManagerService) private _activeDirtyManagerService: IActiveDirtyManagerService,
        @Inject(ConditionalFormatViewModel) private _conditionalFormatViewModel: ConditionalFormatViewModel,
        @Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel

    ) {
        super();
        this._initFormulaCalculationResultChange();
        this._initRuleChange();
    }

    private _initRuleChange() {
        this.disposeWithMe(this._conditionalFormatRuleModel.$ruleChange.subscribe((option) => {
            const { unitId, subUnitId, rule } = option;
            if (option.type === 'delete') {
                this._removeFormulaByCfId(unitId, subUnitId, rule.cfId);
            }
             // @gggpound: todo clear cache when set rule
        }));
    }

    private _initFormulaCalculationResultChange() {
        // Gets the result of the formula calculation and caches it
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetFormulaCalculationResultMutation.id) {
                const params = commandInfo.params as ISetFormulaCalculationResultMutation;
                for (const unitId in params.unitOtherData) {
                    for (const subUnitId in params.unitOtherData[unitId]) {
                        const map = this.getSubUnitFormulaMap(unitId, subUnitId);
                        if (!map) {
                            continue;
                        }
                        const cfIdSet = new Set<string>();
                        for (const formulaId in params.unitOtherData[unitId]![subUnitId]) {
                            const item = map.getValue(formulaId);
                            if (item) {
                                const value = getResultFromFormula(params.unitOtherData[unitId]![subUnitId]![formulaId]);
                                item.result = value!;
                                item.status = FormulaResultStatus.SUCCESS;
                                cfIdSet.add(item.cfId);
                            }
                        }
                        for (const cfId of cfIdSet) {
                            const rule = this._conditionalFormatRuleModel.getRule(unitId, subUnitId, cfId);
                            rule && this._conditionalFormatViewModel.markRuleDirty(unitId, subUnitId, rule);
                        }
                    }
                }
            }
        }));

        // Register formula with Dirty Logic
        this._activeDirtyManagerService.register(conditionalFormatFormulaMarkDirty.id,
            { commandId: conditionalFormatFormulaMarkDirty.id,
              getDirtyData(commandInfo) {
                  const params = commandInfo.params as IConditionalFormatFormulaMarkDirtyParams;
                  return {
                      dirtyUnitOtherFormulaMap: params,
                  };
              } });

        // Sum up formulas that need to be marked dirty
        this.disposeWithMe(this.formulaChange$.pipe(bufferTime(16), filter((list) => !!list.length), map((list) => {
            return list.reduce((result, cur) => {
                const { unitId, subUnitId, formulaId } = cur;
                if (!result[unitId]) {
                    result[unitId] = {};
                }
                if (!result[unitId][subUnitId]) {
                    result[unitId][subUnitId] = {};
                }
                result[unitId][subUnitId][formulaId] = true;
                return result;
            }, {} as { [unitId: string]: { [sunUnitId: string]: { [formulaId: string]: true } } });
        })).subscribe((obj) => {
            this._commandService.executeCommand(conditionalFormatFormulaMarkDirty.id,
                obj as IConditionalFormatFormulaMarkDirtyParams);
        }));
    }

    private _ensureSubunitFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map<string, RefAlias<IFormulaItem, 'formulaId' | 'formulaText'>>();
            this._formulaMap.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new RefAlias<IFormulaItem, 'formulaId' | 'formulaText'>([], ['formulaId', 'formulaText']);
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    public getSubUnitFormulaMap(unitId: string, subUnitId: string) {
        return this._formulaMap.get(unitId)?.get(subUnitId);
    }

    public registerFormula(unitId: string, subUnitId: string, cfId: string, formulaText: string) {
        const subUnitFormulaMap = this._ensureSubunitFormulaMap(unitId, subUnitId);
        const formulaItem = subUnitFormulaMap.getValue(formulaText);
        if (formulaItem) {
            if (!subUnitFormulaMap.getValues().some((item) => item.cfId === cfId)) {
                formulaItem.count++;
            }
            return;
        }
        const formulaId = this._createFormulaId(unitId, subUnitId);
        subUnitFormulaMap.addValue({ formulaId, formulaText, cfId, status: FormulaResultStatus.WAIT, count: 1 });
        const config = { item: { f: formulaText }, unitId, subUnitId, formulaId };
        this._commandService.executeCommand(SetOtherFormulaMutation.id, config);
        this._formulaChange$.next({ unitId, cfId, subUnitId, formulaText, formulaId });
    }

    private _removeFormulaByCfId(unitId: string, subUnitId: string, cfId: string) {
        const subUnitFormulaMap = this._ensureSubunitFormulaMap(unitId, subUnitId);
        const reduceCount = (formulaText: string) => {
            const formulaItem = subUnitFormulaMap.getValue(formulaText);
            if (formulaItem) {
                formulaItem.count--;
                if (formulaItem.count <= 0) {
                    subUnitFormulaMap.deleteValue(formulaText);
                }
            }
        };
        subUnitFormulaMap.getValues().filter((item) => item.cfId === cfId).forEach((item) => {
            reduceCount(item.formulaText);
        });
    }

    public getFormulaResult(unitId: string, subUnitId: string, formulaText: string) {
        const map = this.getSubUnitFormulaMap(unitId, subUnitId);
        if (!map) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        const item = map.getValue(formulaText);
        if (!item) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        if (FormulaResultStatus.SUCCESS === item.status) {
            return { result: item.result, status: FormulaResultStatus.SUCCESS };
        }

        if (item.status === FormulaResultStatus.WAIT) {
            return { status: FormulaResultStatus.WAIT };
        }

        if (item.status === FormulaResultStatus.ERROR) {
            return { status: FormulaResultStatus.ERROR };
        }
    }

    _createFormulaId(unitId: string, subUnitId: string) {
        return `sheet.cf_${unitId}_${subUnitId}_${Tools.generateRandomId(8)}`;
    }
}
