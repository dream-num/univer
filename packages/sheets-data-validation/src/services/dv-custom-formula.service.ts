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
import { DataValidationType, Disposable, isFormulaString, ObjectMatrix, Range } from '@univerjs/core';
import { isFormulaTransformable, LexerTreeBuilder, transformFormula } from '@univerjs/engine-formula';
import { Inject } from '@wendellhu/redi';
import { DataValidationModel } from '@univerjs/data-validation';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import { DataValidationCacheService } from './dv-cache.service';

interface IDataValidationFormula {
    ruleId: string;
    // formulaText: string;
    formulaId: string;
    temp?: boolean;
}

interface IFormulaData {
    formula: string;
    originRow: number;
    originCol: number;
    isTransformable: boolean;
    formulaId?: string;
}

interface ICellData {
    row: number;
    column: number;
}

type RuleId = string;
type UnitId = string;
type SubUnitId = string;
type FormulaId = string;

//
export class DataValidationCustomFormulaService extends Disposable {
    private _formulaMap: Map<UnitId, Map<SubUnitId, ObjectMatrix<IDataValidationFormula>>> = new Map();
    /**
     * Map of origin formula of rule
     */
    private _ruleFormulaMap: Map<UnitId, Map<SubUnitId, Map<RuleId, IFormulaData>>> = new Map();

    /**
     * reflect of formulaId to cell, only store transformable formula
     */
    private _formulaCellMap: Map<UnitId, Map<SubUnitId, Map<FormulaId, ICellData>>> = new Map();

    constructor(
        @Inject(RegisterOtherFormulaService) private _registerOtherFormulaService: RegisterOtherFormulaService,
        @Inject(LexerTreeBuilder) private _lexerTreeBuilder: LexerTreeBuilder,
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
                for (const subUnitId in unitMap) {
                    const results = unitMap[subUnitId];
                    const { formulaCellMap, ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);
                    const manager = this._dataValidationModel.ensureManager(unitId, subUnitId);
                    results.forEach((result) => {
                        const ruleInfo = ruleFormulaMap.get(result.extra?.ruleId);
                        const cellInfo = formulaCellMap.get(result.formulaId);
                        const rule = manager.getRuleById(result.extra?.ruleId);

                        if (rule && ruleInfo && !ruleInfo.isTransformable) {
                            this._dataValidationCacheService.markRangeDirty(unitId, subUnitId, rule.ranges);
                        }

                        if (cellInfo) {
                            this._dataValidationCacheService.markCellDirty(unitId, subUnitId, cellInfo.row, cellInfo.column);
                        }
                    });
                }
            }
        }));
    }

    private _ensureMaps(unitId: string, subUnitId: string) {
        let formulaUnitMap = this._formulaMap.get(unitId);
        let ruleFormulaUnitMap = this._ruleFormulaMap.get(unitId);
        let formulaCellUnitMap = this._formulaCellMap.get(unitId);

        if (!formulaUnitMap || !ruleFormulaUnitMap || !formulaCellUnitMap) {
            formulaUnitMap = new Map<string, ObjectMatrix<IDataValidationFormula>>();
            ruleFormulaUnitMap = new Map();
            formulaCellUnitMap = new Map();
            this._formulaMap.set(unitId, formulaUnitMap);
            this._ruleFormulaMap.set(unitId, ruleFormulaUnitMap);
            this._formulaCellMap.set(unitId, formulaCellUnitMap);
        }

        let formulaMap = formulaUnitMap.get(subUnitId);
        let ruleFormulaMap = ruleFormulaUnitMap.get(subUnitId);
        let formulaCellMap = formulaCellUnitMap.get(subUnitId);

        if (!formulaMap || !ruleFormulaMap || !formulaCellMap) {
            formulaMap = new ObjectMatrix<IDataValidationFormula>();
            formulaUnitMap.set(subUnitId, formulaMap);

            ruleFormulaMap = new Map();
            ruleFormulaUnitMap.set(subUnitId, ruleFormulaMap);

            formulaCellMap = new Map();
            formulaCellUnitMap.set(subUnitId, formulaCellMap);
        }
        return {
            formulaMap,
            ruleFormulaMap,
            formulaCellMap,
        };
    };

    private _registerFormula(unitId: string, subUnitId: string, ruleId: string, formulaString: string) {
        return this._registerOtherFormulaService.registerFormula(unitId, subUnitId, formulaString, { ruleId });
    };

    deleteByRuleId(unitId: string, subUnitId: string, ruleId: string) {
        const { formulaMap, formulaCellMap, ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);
        const rule = this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId) as ISheetDataValidationRule;
        const formulaIdList = new Set<string>();
        const formulaInfo = ruleFormulaMap.get(ruleId);

        if (!rule || !formulaInfo) {
            return;
        }

        // formulaIdList.add(formulaInfo.formulaId);
        ruleFormulaMap.delete(ruleId);

        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const value = formulaMap.getValue(row, col);
                if (value && value.ruleId === ruleId) {
                    const { formulaId } = value;
                    formulaMap.realDeleteValue(row, col);
                    formulaIdList.add(formulaId);
                    formulaCellMap.delete(formulaId);
                }
            });
        });

        this._registerOtherFormulaService.deleteFormula(unitId, subUnitId, Array.from(formulaIdList.values()));
    }

    private _addFormulaByRange(unitId: string, subUnitId: string, ruleId: string, formula: string, ranges: IRange[]) {
        const { formulaMap, ruleFormulaMap, formulaCellMap } = this._ensureMaps(unitId, subUnitId);

        if (!formula) {
            return;
        }

        const isTransformable = isFormulaTransformable(
            this._lexerTreeBuilder,
            formula
        );

        const originRow = ranges[0].startRow;
        const originCol = ranges[0].startColumn;

        let originFormulaId: string | undefined;
        if (isTransformable) {
            ranges.forEach((range) => {
                Range.foreach(range, (row, column) => {
                    const relativeFormula = transformFormula(
                        this._lexerTreeBuilder,
                        formula,
                        originRow,
                        originCol,
                        row,
                        column
                    );
                    const formulaId = this._registerFormula(unitId, subUnitId, ruleId, relativeFormula);
                    formulaMap.setValue(row, column, {
                        formulaId,
                        // formulaText: relativeFormula,
                        ruleId,
                    });
                    formulaCellMap.set(formulaId, { row, column });
                });
            });
        } else {
            originFormulaId = this._registerFormula(unitId, subUnitId, ruleId, formula);
            ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    formulaMap.setValue(row, col, {
                        formulaId: originFormulaId!,
                        // formulaText: formula,
                        ruleId,
                    });
                });
            });
        }

        ruleFormulaMap.set(ruleId, {
            formula,
            originCol,
            originRow,
            isTransformable,
            formulaId: originFormulaId,
        });
    }

    addRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const { ranges, formula1, uid: ruleId, type } = rule;
        if (type !== DataValidationType.CUSTOM || !formula1 || !isFormulaString(formula1)) {
            return;
        }
        this._addFormulaByRange(unitId, subUnitId, ruleId, formula1, ranges);
    }

    updateRuleRanges(unitId: string, subUnitId: string, ruleId: string, oldRanges: IRange[], newRanges: IRange[]) {
        const { formulaMap, ruleFormulaMap, formulaCellMap } = this._ensureMaps(unitId, subUnitId);
        const info = ruleFormulaMap.get(ruleId);
        // isn't custom formula type
        if (!info) {
            return;
        }
        const { formula, originCol, originRow, isTransformable, formulaId } = info;
        const deleteFormulaIdList = new Set<string>();

        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const value = formulaMap.getValue(row, col);
                if (value && value.ruleId === ruleId) {
                    value.temp = true;
                }
            });
        });

        newRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const oldValue = formulaMap.getValue(row, col) ?? {};
                if ((oldValue.ruleId !== ruleId)) {
                    const oldRuleFormula = ruleFormulaMap.get(oldValue.ruleId);
                    if (oldRuleFormula?.isTransformable) {
                        deleteFormulaIdList.add(oldValue.formulaId);
                    }

                    if (isTransformable) {
                        const relativeText = transformFormula(this._lexerTreeBuilder, formula, originRow, originCol, row, col);
                        const formulaId = this._registerFormula(unitId, subUnitId, ruleId, relativeText);
                        formulaMap.setValue(row, col, {
                            // formulaText: relativeText,
                            ruleId,
                            formulaId,
                        });
                        formulaCellMap.set(formulaId, { row, column: col });
                    } else {
                        formulaMap.setValue(row, col, {
                            // formulaText: formula,
                            ruleId,
                            formulaId: formulaId!,
                        });
                    }
                } else {
                    oldValue.temp = false;
                }
            });
        });

        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const value = formulaMap.getValue(row, col);
                if (value && value.ruleId === ruleId && value.temp === true) {
                    formulaMap.realDeleteValue(row, col);
                    if (isTransformable) {
                        deleteFormulaIdList.add(value.formulaId);
                    }
                }
            });
        });

        deleteFormulaIdList.forEach((formulaId) => {
            formulaCellMap.delete(formulaId);
        });
        this._registerOtherFormulaService.deleteFormula(unitId, subUnitId, Array.from(deleteFormulaIdList.values()));
    }

    updateRuleFormula(unitId: string, subUnitId: string, ruleId: string, ranges: IRange[], formula: string) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);
        const current = ruleFormulaMap.get(ruleId);
        if (!current || current.formula !== formula) {
            this._addFormulaByRange(unitId, subUnitId, ruleId, formula, ranges);
        }
    }

    getCellFormulaValue(unitId: string, subUnitId: string, row: number, col: number) {
        const { formulaMap } = this._ensureMaps(unitId, subUnitId);
        const current = formulaMap.getValue(row, col);
        if (!current) {
            return Promise.resolve(undefined);
        }

        return this._registerOtherFormulaService.getFormulaValue(unitId, subUnitId, current.formulaId);
    }

    getRuleFormulaInfo(unitId: string, subUnitId: string, ruleId: string) {
        const { ruleFormulaMap } = this._ensureMaps(unitId, subUnitId);

        return ruleFormulaMap.get(ruleId);
    }
}
