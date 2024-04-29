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

import type { ICellData, Nullable, ObjectMatrix } from '@univerjs/core';
import { BooleanNumber, CellValueType, Disposable, ICommandService, RefAlias, toDisposable, Tools } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import type { IRemoveOtherFormulaMutationParams, ISetFormulaCalculationResultMutation, ISetOtherFormulaMutationParams } from '@univerjs/engine-formula';
import { IActiveDirtyManagerService, RemoveOtherFormulaMutation,
    SetFormulaCalculationResultMutation,
    SetOtherFormulaMutation } from '@univerjs/engine-formula';

import { Subject } from 'rxjs';
import { bufferTime, filter, map } from 'rxjs/operators';
import type { IConditionalFormattingFormulaMarkDirtyParams } from '../commands/mutations/formula-mark-dirty.mutation';
import { ConditionalFormattingFormulaMarkDirty } from '../commands/mutations/formula-mark-dirty.mutation';
import { ConditionalFormattingViewModel } from '../models/conditional-formatting-view-model';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';
import { ConditionalFormattingService } from './conditional-formatting.service';

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
    if (v?.t === CellValueType.BOOLEAN) {
        return v.v === BooleanNumber.TRUE || v.v === true;
    }
    return v ? v.v : false;
};
// TODO: @Gggpound
// It may be possible later to abstract a service that manages the results of an asynchronous calculation to handle the use of the last calculation before waiting for the result to return.
export class ConditionalFormattingFormulaService extends Disposable {
    private _formulaMap: Map<string, Map<string, RefAlias<IFormulaItem, 'formulaId' | 'formulaText'>>> = new Map();

    private _cache: Map<string, Map<string, Map<string, ObjectMatrix<unknown>>>> = new Map();

    private _formulaChange$ = new Subject<{
        unitId: string; subUnitId: string; cfId: string; formulaText: string;formulaId: string;
    }>();

    public formulaChange$ = this._formulaChange$.asObservable();

    constructor(
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(Injector) private _injector: Injector,
        @Inject(IActiveDirtyManagerService) private _activeDirtyManagerService: IActiveDirtyManagerService,
        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel

    ) {
        super();
        this._initFormulaCalculationResultChange();
        this._initRuleChange();
        this._initCache();
        this.disposeWithMe(toDisposable(() => {
            this._cache.clear();
            this._formulaMap.clear();
        }));
    }

    private _initCache() {
        const _conditionalFormattingService = this._injector.get(ConditionalFormattingService);
        this.disposeWithMe(_conditionalFormattingService.ruleComputeStatus$.subscribe((option) => {
            const { unitId, subUnitId, status, result, cfId } = option;
            if (status === 'end' && result) {
                const cacheMap = this._ensureCacheMap(unitId, subUnitId);
                cacheMap.set(cfId, result);
            }
        }));
        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.subscribe((option) => {
            if (option.type === 'delete') {
                const { unitId, subUnitId, rule } = option;
                this._deleteCache(unitId, subUnitId, rule.cfId);
            }
        }));
    }

    private _initRuleChange() {
        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.subscribe((option) => {
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
                            const item = map.getValue(formulaId, ['formulaId']);
                            if (item) {
                                const value = getResultFromFormula(params.unitOtherData[unitId]![subUnitId]![formulaId]);
                                item.result = value!;
                                item.status = FormulaResultStatus.SUCCESS;
                                cfIdSet.add(item.cfId);
                            }
                        }
                        for (const cfId of cfIdSet) {
                            const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                            rule && this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
                        }
                    }
                }
            }
        }));

        // Register formula with Dirty Logic
        this._activeDirtyManagerService.register(ConditionalFormattingFormulaMarkDirty.id,
            { commandId: ConditionalFormattingFormulaMarkDirty.id,
              getDirtyData(commandInfo) {
                  const params = commandInfo.params as IConditionalFormattingFormulaMarkDirtyParams;
                  return {
                      dirtyUnitOtherFormulaMap: params,
                  };
              } });

        // Sum up formulas that need to be marked dirty
        this.formulaChange$.pipe(bufferTime(16), filter((list) => !!list.length), map((list) => {
            return list.reduce((result, cur) => {
                const { unitId, subUnitId, formulaId, formulaText } = cur;
                if (!result[unitId]) {
                    result[unitId] = {};
                }
                if (!result[unitId][subUnitId]) {
                    result[unitId][subUnitId] = {};
                }
                result[unitId][subUnitId][formulaId] = { f: formulaText };
                return result;
            }, {} as { [unitId: string]: { [sunUnitId: string]: { [formulaId: string]: { f: string } } } });
        })).subscribe((result) => {
            for (const unitId in result) {
                for (const subUnitId in result[unitId]) {
                    const value = result[unitId][subUnitId];
                    const config: ISetOtherFormulaMutationParams = { unitId, subUnitId, formulaMap: value };
                    this._commandService.executeCommand(SetOtherFormulaMutation.id, config).then(() => {
                        this._commandService.executeCommand(ConditionalFormattingFormulaMarkDirty.id,
                            { [unitId]: { [subUnitId]: value } } as unknown as IConditionalFormattingFormulaMarkDirtyParams);
                    });
                }
            }
        });
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

    private _ensureCacheMap(unitId: string, subUnitId: string) {
        let unitMap = this._cache.get(unitId);
        if (!unitMap) {
            unitMap = new Map<string, Map<string, ObjectMatrix<any>>>();
            this._cache.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    private _deleteCache(unitId: string, subUnitId: string, cfId?: string) {
        const unitCache = this._cache.get(unitId);
        if (unitCache) {
            const subUnitCache = unitCache.get(subUnitId);
            if (subUnitCache) {
                if (cfId) {
                    subUnitCache.delete(cfId);
                } else {
                    subUnitCache.clear();
                }
            }
        }
    }

    public getCache(unitId: string, subUnitId: string, cfId: string) {
        const map = this._ensureCacheMap(unitId, subUnitId);
        return map.get(cfId);
    }

    public getSubUnitFormulaMap(unitId: string, subUnitId: string) {
        return this._formulaMap.get(unitId)?.get(subUnitId);
    }

    public registerFormula(unitId: string, subUnitId: string, cfId: string, formulaText: string) {
        const subUnitFormulaMap = this._ensureSubunitFormulaMap(unitId, subUnitId);
        const formulaItem = subUnitFormulaMap.getValue(formulaText, ['formulaText']);
        if (formulaItem) {
            if (!subUnitFormulaMap.getValues().some((item) => item.cfId === cfId)) {
                formulaItem.count++;
            }
            return;
        }
        const formulaId = this._createFormulaId(unitId, subUnitId);
        subUnitFormulaMap.addValue({ formulaId, formulaText, cfId, status: FormulaResultStatus.WAIT, count: 1 });
        this._formulaChange$.next({ unitId, cfId, subUnitId, formulaText, formulaId });
    }

    private _removeFormulaByCfId(unitId: string, subUnitId: string, cfId: string) {
        const subUnitFormulaMap = this._ensureSubunitFormulaMap(unitId, subUnitId);
        const reduceCount = (formulaText: string) => {
            const formulaItem = subUnitFormulaMap.getValue(formulaText, ['formulaText']);
            if (formulaItem) {
                formulaItem.count--;
                if (formulaItem.count <= 0) {
                    subUnitFormulaMap.deleteValue(formulaText);
                }
            }
        };
        const values = subUnitFormulaMap.getValues().filter((item) => item.cfId === cfId);
        values.forEach((item) => {
            reduceCount(item.formulaText);
        });
        const formulaIdList = values.map((item) => item.formulaId);
        this._commandService.executeCommand(RemoveOtherFormulaMutation.id, { unitId, subUnitId, formulaIdList } as IRemoveOtherFormulaMutationParams);
    }

    public getFormulaResult(unitId: string, subUnitId: string, formulaText: string) {
        const map = this.getSubUnitFormulaMap(unitId, subUnitId);
        if (!map) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        const item = map.getValue(formulaText, ['formulaText']);
        if (!item) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        if (FormulaResultStatus.SUCCESS === item.status) {
            return { result: item.result, status: FormulaResultStatus.SUCCESS };
        }

        if (item.status === FormulaResultStatus.WAIT) {
            return { status: FormulaResultStatus.WAIT };
        }

        return { status: FormulaResultStatus.ERROR };
    }

    _createFormulaId(unitId: string, subUnitId: string) {
        return `sheet.cf_${unitId}_${subUnitId}_${Tools.generateRandomId(8)}`;
    }
}
