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

import type { IRange, ISheetDataValidationRule } from '@univerjs/core';
import { DataValidationType, Disposable, Inject, isFormulaString, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import { getFormulaCellData } from '../utils/formula';
import { DataValidationCacheService } from './dv-cache.service';

interface IFormulaData {
    formula: string;
    originRow: number;
    originCol: number;
    isTransformable: boolean;
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

    constructor(
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @Inject(RegisterOtherFormulaService) private _registerOtherFormulaService: RegisterOtherFormulaService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService
    ) {
        super();

        this._initFormulaResultHandler();
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

                        if (rule && ruleInfo && !ruleInfo.isTransformable) {
                            this._dataValidationCacheService.markRangeDirty(unitId, subUnitId, rule.ranges);
                        }
                    });
                }
            }
        }));
    }

    private _ensureMaps(unitId: string, subUnitId: string) {
        let ruleFormulaUnitMap = this._ruleFormulaMap.get(unitId);

        if (!ruleFormulaUnitMap) {
            ruleFormulaUnitMap = new Map();
            this._ruleFormulaMap.set(unitId, ruleFormulaUnitMap);
        }

        let ruleFormulaMap = ruleFormulaUnitMap.get(subUnitId);

        if (!ruleFormulaMap) {
            ruleFormulaMap = new Map();
            ruleFormulaUnitMap.set(subUnitId, ruleFormulaMap);
        }
        return { ruleFormulaMap };
    };

    private _registerFormula(unitId: string, subUnitId: string, ruleId: string, formulaString: string, ranges: IRange[]) {
        return this._registerOtherFormulaService.registerFormulaWithRange(unitId, subUnitId, formulaString, ranges, { ruleId });
    };

    deleteByRuleId(unitId: string, subUnitId: string, ruleId: string) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);
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
    }

    private _addFormulaByRange(unitId: string, subUnitId: string, ruleId: string, formula: string, ranges: IRange[]) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);

        if (!formula) {
            return;
        }

        const originRow = ranges[0].startRow;
        const originCol = ranges[0].startColumn;

        const formulaId = this._registerFormula(unitId, subUnitId, ruleId, formula, ranges);

        ruleFormulaMap.set(ruleId, {
            formula,
            originCol,
            originRow,
            formulaId,
            isTransformable: true,
        });
    }

    addRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const { ranges, formula1, uid: ruleId, type } = rule;
        if (type !== DataValidationType.CUSTOM || !formula1 || !isFormulaString(formula1)) {
            return;
        }
        this._addFormulaByRange(unitId, subUnitId, ruleId, formula1, ranges);
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

    getRuleFormulaInfo(unitId: string, subUnitId: string, ruleId: string) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);

        return ruleFormulaMap.get(ruleId);
    }
}
