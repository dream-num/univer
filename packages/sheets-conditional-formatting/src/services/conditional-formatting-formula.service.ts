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

import type { ICellData, IRange, Nullable } from '@univerjs/core';
import type { IOtherFormulaResult } from '@univerjs/sheets-formula';
import type { IConditionalFormattingRuleConfig } from '../models/type';
import { BooleanNumber, CellValueType, Disposable, Inject, ObjectMatrix, RefAlias } from '@univerjs/core';
import { FormulaResultStatus, RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import { Subject } from 'rxjs';

import { CFRuleType, CFValueType } from '../base/const';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';

// eslint-disable-next-line ts/consistent-type-definitions
type IFormulaItem = {
    formulaText: string;
    cfId: string;
    id: string;
    unitId: string;
    subUnitId: string;
    formulaId: string;
};
// TODO: @Gggpound
// It may be possible later to abstract a service that manages the results of an asynchronous calculation to handle the use of the last calculation before waiting for the result to return.
export class ConditionalFormattingFormulaService extends Disposable {
    // Cache Formula ID and formula mapping.
    private _formulaMap: Map<string, Map<string, RefAlias<IFormulaItem, 'id' | 'formulaId'>>> = new Map();

    private _result$ = new Subject<IFormulaItem & { isAllFinished: boolean }>();
    public result$ = this._result$.asObservable();

    constructor(
        @Inject(RegisterOtherFormulaService) private _registerOtherFormulaService: RegisterOtherFormulaService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel
    ) {
        super();
        this._initFormulaResultChange();
        this._initRuleChange();
    }

    private _initRuleChange() {
        const isNeedMarkFormulaDirty = (rule: IConditionalFormattingRuleConfig) => {
            switch (rule.type) {
                case CFRuleType.colorScale: {
                    return rule.config.some((item) => item.value.type === CFValueType.formula);
                }
                case CFRuleType.dataBar: {
                    return [rule.config.max, rule.config.min].some((item) => item.type === CFValueType.formula);
                }
                case CFRuleType.iconSet: {
                    return rule.config.some((item) => item.value.type === CFValueType.formula);
                }
            }
        };
        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.subscribe((option) => {
            const { unitId, subUnitId, rule, oldRule } = option;
            if (option.type === 'delete') {
                this._removeFormulaByCfId(unitId, subUnitId, rule.cfId);
            }
            if (option.type === 'set') {
                if (isNeedMarkFormulaDirty(rule.rule) || (oldRule && isNeedMarkFormulaDirty(oldRule.rule))) {
                    this._removeFormulaByCfId(unitId, subUnitId, rule.cfId);
                }
            }
        }));
    }

    private _initFormulaResultChange() {
        // Subscribe to formula calculation results
        this.disposeWithMe(this._registerOtherFormulaService.formulaResult$.subscribe((results: Record<string, Record<string, IOtherFormulaResult[]>>) => {
            for (const unitId in results) {
                for (const subUnitId in results[unitId]) {
                    const subUnitResults = results[unitId][subUnitId];
                    for (const formulaResult of subUnitResults) {
                        const formulaMapAlias = this._ensureSubunitFormulaMap(unitId, subUnitId).getValue(formulaResult.formulaId, ['formulaId']);
                        if (!formulaMapAlias) {
                            continue;
                        }

                        const allFormulaMapAlias = this._getAllFormulaResultByCfId(unitId, subUnitId, formulaMapAlias.cfId);
                        const isAllFinished = allFormulaMapAlias.every((item) => {
                            const result = this._registerOtherFormulaService.getFormulaValueSync(unitId, subUnitId, item.formulaId);
                            return result?.status === FormulaResultStatus.SUCCESS;
                        });
                        this._result$.next({ ...formulaMapAlias, isAllFinished });
                    }
                }
            }
        }));
    }

    private _ensureSubunitFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map<string, RefAlias<IFormulaItem, 'formulaId' | 'id'>>();
            this._formulaMap.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new RefAlias<IFormulaItem, 'formulaId' | 'id'>([], ['formulaId', 'id']);
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    public getSubUnitFormulaMap(unitId: string, subUnitId: string) {
        return this._formulaMap.get(unitId)?.get(subUnitId);
    }

    public registerFormulaWithRange(unitId: string, subUnitId: string, cfId: string, formulaText: string, ranges: IRange[] = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]) {
        const formulaMap = this._ensureSubunitFormulaMap(unitId, subUnitId);
        const cfFormulaId = this.createCFormulaId(cfId, formulaText);
        if (formulaMap.getValue(cfFormulaId, ['id'])) {
            return;
        }
        const formulaId = this._registerOtherFormulaService.registerFormulaWithRange(unitId, subUnitId, formulaText, ranges);
        formulaMap.addValue({
            formulaText,
            unitId,
            subUnitId,
            cfId,
            id: cfFormulaId,
            formulaId,
        });
    }

    private _removeFormulaByCfId(unitId: string, subUnitId: string, cfId: string) {
        const values = this.deleteCache(unitId, subUnitId, cfId);
        const formulaIdList = values.map((item) => item.formulaId);
        this._registerOtherFormulaService.deleteFormula(unitId, subUnitId, formulaIdList);
    }

    public getFormulaResultWithCoords(unitId: string, subUnitId: string, cfId: string, formulaText: string, row: number = 0, col: number = 0) {
        const map = this.getSubUnitFormulaMap(unitId, subUnitId);
        if (!map) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        const item = map.getValue(this.createCFormulaId(cfId, formulaText), ['id']);
        if (!item) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        const formulaResult = this._registerOtherFormulaService.getFormulaValueSync(unitId, subUnitId, item.formulaId);
        if (!formulaResult) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }

        if (formulaResult.status === FormulaResultStatus.SUCCESS && formulaResult.result) {
            const cellData = formulaResult.result[row]?.[col];
            const result = this._getCellValue(cellData);
            return { result, status: FormulaResultStatus.SUCCESS };
        }

        return { status: formulaResult.status };
    }

    public getFormulaMatrix(unitId: string, subUnitId: string, cfId: string, formulaText: string) {
        const map = this.getSubUnitFormulaMap(unitId, subUnitId);
        if (!map) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        const item = map.getValue(this.createCFormulaId(cfId, formulaText), ['id']);
        if (!item) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        const formulaResult = this._registerOtherFormulaService.getFormulaValueSync(unitId, subUnitId, item.formulaId);
        if (!formulaResult) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }

        if (formulaResult.status === FormulaResultStatus.SUCCESS && formulaResult.result) {
            const result = new ObjectMatrix<string | number | boolean | undefined | null | void>();
            const resultMatrix = new ObjectMatrix(formulaResult.result);
            resultMatrix.forValue((row, col, cellData) => {
                result.setValue(row, col, this._getCellValue(cellData));
            });
            return { result, status: FormulaResultStatus.SUCCESS };
        }

        return { status: formulaResult.status };
    }

    private _getCellValue(cellData: Nullable<ICellData>[][]): string | number | boolean | undefined | null | void {
        if (!cellData || !cellData[0] || !cellData[0][0]) {
            return false;
        }
        const cell = cellData[0][0];
        if (cell?.t === CellValueType.BOOLEAN) {
            return cell.v === BooleanNumber.TRUE || cell.v === true;
        }
        return cell?.v;
    }

    /**
     * If `formulaText` is not provided, then all caches related to `cfId` will be deleted.
     */
    public deleteCache(unitId: string, subUnitId: string, cfId: string, formulaText?: string) {
        const map = this.getSubUnitFormulaMap(unitId, subUnitId);
        if (!map) {
            return [];
        }
        if (formulaText) {
            const key = this.createCFormulaId(cfId, formulaText);
            map.deleteValue(key, ['id']);
            return [];
        } else {
            const values = map.getValues().filter((v) => v.cfId === cfId);
            values.forEach((e) => {
                map.deleteValue(e.formulaId, ['formulaId']);
            });
            return values;
        }
    }

    private _getAllFormulaResultByCfId(unitId: string, subUnitId: string, cfId: string) {
        const map = this.getSubUnitFormulaMap(unitId, subUnitId);
        if (!map) {
            return [];
        }
        const values = map.getValues().filter((v) => v.cfId === cfId);
        return values;
    }

    /**
     * A conditional formatting may have multiple formulas;if the formulas are identical,then the results will be consistent.
     */
    public createCFormulaId(cfId: string, formulaText: string) {
        return `${cfId}_${formulaText}`;
    }
}
