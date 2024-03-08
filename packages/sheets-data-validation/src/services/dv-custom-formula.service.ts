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
import { Disposable, ICommandService, ObjectMatrix, Range, Rectangle, Tools } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { AddDataValidationMutation, DataValidationModel, RemoveAllDataValidationMutation, RemoveDataValidationCommand, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import type { ISetFormulaCalculationResultMutation, ISetOtherFormulaMutationParams } from '@univerjs/engine-formula';
import { deserializeRangeWithSheet, generateStringWithSequence, LexerTreeBuilder, RemoveOtherFormulaMutation, sequenceNodeType, serializeRange, SetFormulaCalculationResultMutation, SetOtherFormulaMutation } from '@univerjs/engine-formula';
import { Inject } from '@wendellhu/redi';
import type { IOtherFormulaManagerInsertParam, IOtherFormulaManagerSearchParam } from '@univerjs/engine-formula/services/other-formula-manager.service.js';
import { Subject } from 'rxjs';
import { FormulaResultStatus, type IDataValidationFormulaResult } from './formula-common';
import { RegisterOtherFormulaService } from './register-formula.service';

interface IDataValidationFormula {
    ruleId: string;
    originFormulaText: string;
    formulaText: string;
    formulaId: string;
}

//
export class DataValidationCustomFormulaService extends Disposable {
    private _formulaMap: Map<string, Map<string, ObjectMatrix<IDataValidationFormula>>> = new Map();
    /**
     * Map of origin formula of rule
     */
    private _ruleFormulaMap: Map<string, Map<string, Map<string, string>>> = new Map();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(RegisterOtherFormulaService) private _registerOtherFormulaService: RegisterOtherFormulaService,
        @Inject(LexerTreeBuilder) private _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();
    }

    private _makeRuleDirty() {}

    private _ensureFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map<string, ObjectMatrix<IDataValidationFormula>>();
            this._formulaMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            // TODO: load from snapshot
            subUnitMap = new ObjectMatrix<IDataValidationFormula>();
        }
        return subUnitMap;
    }

    private _ensureRuleFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._ruleFormulaMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._ruleFormulaMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);

        if (!subUnitMap) {
            subUnitMap = new Map();
        }

        return subUnitMap;
    };

    private _registerFormula(unitId: string, subUnitId: string, ruleId: string, formulaString: string) {
        return this._registerOtherFormulaService.registerFormula(unitId, subUnitId, ruleId, formulaString);
    };

    deleteByRuleId(unitId: string, subUnitId: string, ruleId: string) {
        const formulaMap = this._ensureFormulaMap(unitId, subUnitId);
        const formulaIdList = new Set<string>();

        formulaMap.forValue((row, col, value) => {
            if (value.ruleId === ruleId) {
                const { formulaId } = value;
                formulaMap.realDeleteValue(row, col);
                formulaIdList.add(formulaId);
            }
        });

        this._registerOtherFormulaService.deleteFormula(unitId, subUnitId, Array.from(formulaIdList.values()));
    }

    addRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const { ranges, formula1, uid: ruleId } = rule;
        const formulaMap = this._ensureFormulaMap(unitId, subUnitId);
        const ruleFormulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);

        if (!formula1) {
            return;
        }

        const originSequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula1);
        const formulaId = this._registerFormula(unitId, subUnitId, ruleId, formula1);
        const getRangeFromCell = (row: number, col: number) => ({ startRow: row, endRow: row, startColumn: col, endColumn: col });
        const originRange = getRangeFromCell(rule.ranges[0].startRow, rule.ranges[0].startColumn);

        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const relativeRange = Rectangle.getRelativeRange(getRangeFromCell(row, col), originRange);
                const sequenceNodes = Tools.deepClone(originSequenceNodes);
                const transformSequenceNodes = Array.isArray(sequenceNodes)
                    ? sequenceNodes.map((node) => {
                        if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                            const gridRangeName = deserializeRangeWithSheet(node.token);
                            const newRange = Rectangle.getPositionRange(relativeRange, gridRangeName.range);
                            const newToken = serializeRange(newRange);
                            return {
                                ...node, token: newToken,
                            };
                        }
                        return node;
                    })
                    : sequenceNodes;
                let formulaString = transformSequenceNodes && generateStringWithSequence(transformSequenceNodes);
                if (formulaString) {
                    formulaString = `=${formulaString}`;
                    const item: IDataValidationFormula = {
                        ruleId,
                        formulaId,
                        formulaText: formulaString,
                        originFormulaText: formula1,
                    };
                    formulaMap.setValue(row, col, item);
                    this._registerFormula(unitId, subUnitId, ruleId, formulaString);
                }
            });
        });
        ruleFormulaMap.set(ruleId, formula1);
    }

    updateRuleRanges(unitId: string, subUnitId: string, ruleId: string) {}

    setByObjectMatrix(unitId: string, subUnitId: string, matrix: ObjectMatrix<string>) {
        const formulaMap = this._ensureFormulaMap(unitId, subUnitId);
        const ruleFormulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);

        const lexerMap = new Map<string, >();

        matrix.forValue((row, col, value) => {

        });
    }
}
