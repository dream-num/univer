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

import type { ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { IFormulaInfo, IOtherFormulaResult } from '@univerjs/sheets-formula';
import { DataValidationType, Disposable, Inject, isFormulaString, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import { shouldOffsetFormulaByRange } from '../utils/formula';
import { DataValidationCacheService } from './dv-cache.service';

type RuleId = string;
type UnitId = string;
type SubUnitId = string;

export class DataValidationFormulaService extends Disposable {
    private _formulaRuleMap: Map<UnitId, Map<SubUnitId, Map<RuleId, [IFormulaInfo | undefined, IFormulaInfo | undefined]>>> = new Map();

    constructor(
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @Inject(RegisterOtherFormulaService) private _registerOtherFormulaService: RegisterOtherFormulaService,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(DataValidatorRegistryService) private readonly _validatorRegistryService: DataValidatorRegistryService
    ) {
        super();
        this._initFormulaResultHandler();
    }

    private _initFormulaResultHandler() {
        this.disposeWithMe(this._registerOtherFormulaService.formulaResult$.subscribe((resultMap) => {
            for (const unitId in resultMap) {
                const unitMap = resultMap[unitId];

                const type = this._instanceService.getUnitType(unitId);
                if (type !== UniverInstanceType.UNIVER_SHEET) continue;

                for (const subUnitId in unitMap) {
                    const results = unitMap[subUnitId];
                    const formulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);
                    results.forEach((result) => {
                        if (formulaMap.get(result.extra?.ruleId)) {
                            const rule = this._dataValidationModel.getRuleById(unitId, subUnitId, result.extra?.ruleId);
                            if (rule) {
                                this._dataValidationCacheService.markRangeDirty(unitId, subUnitId, rule.ranges);
                            }
                        };
                    });
                }
            }
        }));
    }

    private _ensureRuleFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaRuleMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._formulaRuleMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);

        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    private _registerSingleFormula(unitId: string, subUnitId: string, formula: string, ruleId: string) {
        const ranges = [{ startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 }];
        return this._registerOtherFormulaService.registerFormulaWithRange(unitId, subUnitId, formula, ranges, { ruleId });
    }

    addRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        if (!shouldOffsetFormulaByRange(rule.type, this._validatorRegistryService) && rule.type !== DataValidationType.CHECKBOX) {
            const { formula1, formula2, uid: ruleId } = rule;
            const isFormula1Legal = isFormulaString(formula1);
            const isFormula2Legal = isFormulaString(formula2);
            if (!isFormula1Legal && !isFormula2Legal) {
                return;
            }
            const formulaRuleMap = this._ensureRuleFormulaMap(unitId, subUnitId);
            const item: [IFormulaInfo | undefined, IFormulaInfo | undefined] = [undefined, undefined];
            if (isFormula1Legal) {
                const id = this._registerSingleFormula(unitId, subUnitId, formula1!, ruleId);
                item[0] = { id, text: formula1! };
            }
            if (isFormula2Legal) {
                const id = this._registerSingleFormula(unitId, subUnitId, formula2!, ruleId);
                item[1] = { id, text: formula2! };
            }
            formulaRuleMap.set(ruleId, item);
        }
    }

    removeRule(unitId: string, subUnitId: string, ruleId: string) {
        const formulaRuleMap = this._ensureRuleFormulaMap(unitId, subUnitId);
        const item = formulaRuleMap.get(ruleId);
        if (!item) {
            return;
        }
        const [formula1, formula2] = item;
        const idList = [formula1?.id, formula2?.id].filter(Boolean) as string[];
        idList.length && this._registerOtherFormulaService.deleteFormula(unitId, subUnitId, idList);
    }

    getRuleFormulaResult(unitId: string, subUnitId: string, ruleId: string): Promise<Nullable<[Nullable<IOtherFormulaResult>, Nullable<IOtherFormulaResult>]>> {
        const ruleFormulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);

        const formulaInfo = ruleFormulaMap.get(ruleId);
        if (!formulaInfo) {
            return Promise.resolve(null);
        }
        const getResult = async (info: IFormulaInfo | undefined) => info && this._registerOtherFormulaService.getFormulaValue(unitId, subUnitId, info.id);

        return Promise.all([
            getResult(formulaInfo[0]),
            getResult(formulaInfo[1]),
        ]);
    }

    getRuleFormulaResultSync(unitId: string, subUnitId: string, ruleId: string) {
        const ruleFormulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);

        const formulaInfo = ruleFormulaMap.get(ruleId);

        if (!formulaInfo) {
            return undefined;
        }

        return formulaInfo.map((i) => {
            if (i) {
                return this._registerOtherFormulaService.getFormulaValueSync(unitId, subUnitId, i.id);
            }

            return undefined;
        });
    }

    getRuleFormulaInfo(unitId: string, subUnitId: string, ruleId: string) {
        const ruleFormulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);
        return ruleFormulaMap.get(ruleId);
    }
}
