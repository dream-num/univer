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

import type { IRange, ISheetDataValidationRule } from '@univerjs/core';
import { Disposable, Inject, isFormulaString, IUniverInstanceService, Rectangle, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import { getFormulaCellData, shouldOffsetFormulaByRange } from '../utils/formula';
import { DataValidationCacheService } from './dv-cache.service';

interface IFormulaData {
    formula: string;
    originRow: number;
    originCol: number;
    formulaId: string;
}

type RuleId = string;
type UnitId = string;
type SubUnitId = string;

export class DataValidationCustomFormulaService extends Disposable {
    /**
     * Map of origin formula of rule
     */
    private _ruleFormulaMap: Map<UnitId, Map<SubUnitId, Map<RuleId, IFormulaData>>> = new Map();
    private _ruleFormulaMap2: Map<UnitId, Map<SubUnitId, Map<RuleId, IFormulaData>>> = new Map();

    constructor(
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @Inject(RegisterOtherFormulaService) private _registerOtherFormulaService: RegisterOtherFormulaService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService,
        @Inject(DataValidatorRegistryService) private readonly _validatorRegistryService: DataValidatorRegistryService
    ) {
        super();

        this._initFormulaResultHandler();
        this._initDirtyRanges();
    }

    private _initFormulaResultHandler() {
        this.disposeWithMe(this._registerOtherFormulaService.formulaResult$.subscribe((resultMap) => {
            for (const unitId in resultMap) {
                const unitMap = resultMap[unitId];

                const type = this._instanceSrv.getUnitType(unitId);
                if (type !== UniverInstanceType.UNIVER_SHEET) continue;

                for (const subUnitId in unitMap) {
                    const results = unitMap[subUnitId];
                    const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);
                    results.forEach((result) => {
                        const ruleInfo = ruleFormulaMap.get(result.extra?.ruleId);
                        const rule = this._dataValidationModel.getRuleById(unitId, subUnitId, result.extra?.ruleId);

                        if (rule && ruleInfo) {
                            this._dataValidationCacheService.markRangeDirty(unitId, subUnitId, rule.ranges);
                        }
                    });
                }
            }
        }));
    }

    private _ensureMaps(unitId: string, subUnitId: string) {
        let ruleFormulaUnitMap = this._ruleFormulaMap.get(unitId);
        let ruleFormulaUnitMap2 = this._ruleFormulaMap2.get(unitId);
        if (!ruleFormulaUnitMap) {
            ruleFormulaUnitMap = new Map();
            this._ruleFormulaMap.set(unitId, ruleFormulaUnitMap);
        }
        if (!ruleFormulaUnitMap2) {
            ruleFormulaUnitMap2 = new Map();
            this._ruleFormulaMap2.set(unitId, ruleFormulaUnitMap2);
        }

        let ruleFormulaMap = ruleFormulaUnitMap.get(subUnitId);

        if (!ruleFormulaMap) {
            ruleFormulaMap = new Map();
            ruleFormulaUnitMap.set(subUnitId, ruleFormulaMap);
        }

        let ruleFormulaMap2 = ruleFormulaUnitMap2.get(subUnitId);
        if (!ruleFormulaMap2) {
            ruleFormulaMap2 = new Map();
            ruleFormulaUnitMap2.set(subUnitId, ruleFormulaMap2);
        }

        return { ruleFormulaMap, ruleFormulaMap2 };
    };

    private _registerFormula(unitId: string, subUnitId: string, ruleId: string, formulaString: string, ranges: IRange[]) {
        return this._registerOtherFormulaService.registerFormulaWithRange(unitId, subUnitId, formulaString, ranges, { ruleId });
    };

    private _handleDirtyRanges(unitId: string, subUnitId: string, ranges: IRange[]) {
        const rules = this._dataValidationModel.getRules(unitId, subUnitId);
        rules.forEach((rule) => {
            const ruleRanges = rule.ranges as IRange[];
            const hasOverLap = Rectangle.doAnyRangesIntersect(ruleRanges, ranges);
            if (hasOverLap) {
                this.makeRuleDirty(unitId, subUnitId, rule.uid);
            }
        });
    }

    private _initDirtyRanges() {
        this._dataValidationCacheService.dirtyRanges$.subscribe((data) => {
            if (data.isSetRange) {
                this._handleDirtyRanges(data.unitId, data.subUnitId, data.ranges);
            }
        });
    }

    deleteByRuleId(unitId: string, subUnitId: string, ruleId: string) {
        const { ruleFormulaMap, ruleFormulaMap2 } = this._ensureMaps(unitId, subUnitId);
        const rule = this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId) as ISheetDataValidationRule;
        const formulaInfo = ruleFormulaMap.get(ruleId);

        if (!rule || !formulaInfo) {
            return;
        }

        const current = ruleFormulaMap.get(ruleId);
        if (current) {
            ruleFormulaMap.delete(ruleId);
            this._registerOtherFormulaService.deleteFormula(unitId, subUnitId, [current.formulaId]);
        }

        const current2 = ruleFormulaMap2.get(ruleId);
        if (current2) {
            ruleFormulaMap2.delete(ruleId);
            this._registerOtherFormulaService.deleteFormula(unitId, subUnitId, [current2.formulaId]);
        }
    }

    private _addFormulaByRange(unitId: string, subUnitId: string, ruleId: string, formula: string | undefined, formula2: string | undefined, ranges: IRange[]) {
        const { ruleFormulaMap, ruleFormulaMap2 } = this._ensureMaps(unitId, subUnitId);

        const originRow = ranges[0].startRow;
        const originCol = ranges[0].startColumn;

        if (formula && isFormulaString(formula)) {
            const formulaId = this._registerFormula(unitId, subUnitId, ruleId, formula, ranges);
            ruleFormulaMap.set(ruleId, {
                formula,
                originCol,
                originRow,
                formulaId,
            });
        }

        if (formula2 && isFormulaString(formula2)) {
            const formulaId2 = this._registerFormula(unitId, subUnitId, ruleId, formula2, ranges);
            ruleFormulaMap2.set(ruleId, {
                formula: formula2,
                originCol,
                originRow,
                formulaId: formulaId2,
            });
        }
    }

    addRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        if (shouldOffsetFormulaByRange(rule.type, this._validatorRegistryService)) {
            const { ranges, formula1, formula2, uid: ruleId } = rule;
            this._addFormulaByRange(unitId, subUnitId, ruleId, formula1, formula2, ranges);
        }
    }

    async getCellFormulaValue(unitId: string, subUnitId: string, ruleId: string, row: number, column: number) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);
        const current = ruleFormulaMap.get(ruleId);
        if (!current) {
            return Promise.resolve(undefined);
        }

        const result = await this._registerOtherFormulaService.getFormulaValue(unitId, subUnitId, current.formulaId);
        const { originRow, originCol } = current;
        const offsetRow = row - originRow;
        const offsetCol = column - originCol;
        return getFormulaCellData(result?.result?.[offsetRow]?.[offsetCol]);
    }

    async getCellFormula2Value(unitId: string, subUnitId: string, ruleId: string, row: number, column: number) {
        const { ruleFormulaMap2 } = this._ensureMaps(unitId, subUnitId);
        const current = ruleFormulaMap2.get(ruleId);
        if (!current) {
            return Promise.resolve(undefined);
        }

        const result = await this._registerOtherFormulaService.getFormulaValue(unitId, subUnitId, current.formulaId);
        const { originRow, originCol } = current;
        const offsetRow = row - originRow;
        const offsetCol = column - originCol;
        return getFormulaCellData(result?.result?.[offsetRow]?.[offsetCol]);
    }

    getCellFormulaValueSync(unitId: string, subUnitId: string, ruleId: string, row: number, column: number) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);
        const current = ruleFormulaMap.get(ruleId);
        if (!current) {
            return undefined;
        }

        const result = this._registerOtherFormulaService.getFormulaValueSync(unitId, subUnitId, current.formulaId);
        const { originRow, originCol } = current;
        const offsetRow = row - originRow;
        const offsetCol = column - originCol;
        return getFormulaCellData(result?.result?.[offsetRow]?.[offsetCol]);
    }

    getCellFormula2ValueSync(unitId: string, subUnitId: string, ruleId: string, row: number, column: number) {
        const { ruleFormulaMap2 } = this._ensureMaps(unitId, subUnitId);
        const current = ruleFormulaMap2.get(ruleId);
        if (!current) {
            return undefined;
        }

        const result = this._registerOtherFormulaService.getFormulaValueSync(unitId, subUnitId, current.formulaId);
        const { originRow, originCol } = current;
        const offsetRow = row - originRow;
        const offsetCol = column - originCol;
        return getFormulaCellData(result?.result?.[offsetRow]?.[offsetCol]);
    }

    getRuleFormulaInfo(unitId: string, subUnitId: string, ruleId: string) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);

        return ruleFormulaMap.get(ruleId);
    }

    makeRuleDirty(unitId: string, subUnitId: string, ruleId: string) {
        const formula1 = this._ruleFormulaMap.get(unitId)?.get(subUnitId)?.get(ruleId);
        const formula2 = this._ruleFormulaMap2.get(unitId)?.get(subUnitId)?.get(ruleId);
        if (formula1) {
            this._registerOtherFormulaService.markFormulaDirty(unitId, subUnitId, formula1.formulaId);
        }
        if (formula2) {
            this._registerOtherFormulaService.markFormulaDirty(unitId, subUnitId, formula2.formulaId);
        }
    }
}
