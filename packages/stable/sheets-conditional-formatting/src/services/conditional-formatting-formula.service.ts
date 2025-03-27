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
import type { IRemoveOtherFormulaMutationParams, ISetFormulaCalculationResultMutation, ISetOtherFormulaMutationParams } from '@univerjs/engine-formula';
import type { IConditionalFormattingFormulaMarkDirtyParams } from '../commands/mutations/formula-mark-dirty.mutation';
import type { IConditionalFormattingRuleConfig } from '../models/type';

import { BooleanNumber, CellValueType, Disposable, ICommandService, Inject, ObjectMatrix, RefAlias, Tools } from '@univerjs/core';
import {
    IActiveDirtyManagerService,
    RemoveOtherFormulaMutation,
    SetFormulaCalculationResultMutation,
    SetOtherFormulaMutation,
} from '@univerjs/engine-formula';
import { Subject } from 'rxjs';

import { CFRuleType, CFValueType } from '../base/const';

import { ConditionalFormattingFormulaMarkDirty } from '../commands/mutations/formula-mark-dirty.mutation';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';

// eslint-disable-next-line ts/consistent-type-definitions
type IFormulaItem = {
    formulaText: string;
    cfId: string;
    id: string;
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
    status: FormulaResultStatus;
    formulaId: string;
    result: ObjectMatrix<string | number | boolean | undefined | null | void>;
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
    // Cache Formula ID and formula mapping.
    private _formulaMap: Map<string, Map<string, RefAlias<IFormulaItem, 'id' | 'formulaId'>>> = new Map();

    private _result$ = new Subject<IFormulaItem & { isAllFinished: boolean }>();
    public result$ = this._result$.asObservable();

    constructor(
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(IActiveDirtyManagerService) private _activeDirtyManagerService: IActiveDirtyManagerService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel

    ) {
        super();
        this._initFormulaCalculationResultChange();
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

    private _initFormulaCalculationResultChange() {
        // Gets the result of the formula calculation and caches it
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetFormulaCalculationResultMutation.id) {
                const params = commandInfo.params as ISetFormulaCalculationResultMutation;
                for (const unitId in params.unitOtherData) {
                    for (const subUnitId in params.unitOtherData[unitId]) {
                        for (const formulaId in params.unitOtherData[unitId]![subUnitId]) {
                            const resultMatrix = new ObjectMatrix(params.unitOtherData[unitId][subUnitId][formulaId]);
                            const formulaMapAlias = this._ensureSubunitFormulaMap(unitId, subUnitId).getValue(formulaId, ['formulaId']);
                            if (!formulaMapAlias) {
                                continue;
                            }
                            const ranges = formulaMapAlias.ranges;

                            if (!ranges) {
                                continue;
                            }
                            const resultObject = formulaMapAlias.result;

                            // The engine's calculation result only has the offset, and the actual position needs to be calculated from the upper left corner.
                            const startRow = ranges[0].startRow;
                            const startCol = ranges[0].startColumn;

                            resultMatrix.forValue((row, col, value) => {
                                resultObject.setValue(startRow + row, startCol + col, getResultFromFormula(value));
                            });

                            formulaMapAlias.status = FormulaResultStatus.SUCCESS;
                            const allFormulaMapAlias = this._getAllFormulaResultByCfId(unitId, subUnitId, formulaMapAlias.cfId);
                            const isAllFinished = allFormulaMapAlias.every((item) => item.status === FormulaResultStatus.SUCCESS);
                            this._result$.next({ ...formulaMapAlias, isAllFinished });
                        }
                    }
                }
            }
        }));

        // Register formula with Dirty Logic
        this._activeDirtyManagerService.register(ConditionalFormattingFormulaMarkDirty.id, {
            commandId: ConditionalFormattingFormulaMarkDirty.id,
            getDirtyData(commandInfo) {
                const params = commandInfo.params as IConditionalFormattingFormulaMarkDirtyParams;
                return {
                    dirtyUnitOtherFormulaMap: params,
                };
            },
        });
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
        const formulaId = this._createFormulaId(unitId, subUnitId);
        formulaMap.addValue({
            formulaText,
            unitId,
            subUnitId,
            cfId,
            id: cfFormulaId,
            ranges,
            formulaId,
            status: FormulaResultStatus.WAIT,
            result: new ObjectMatrix(),
        });
        const params: ISetOtherFormulaMutationParams = {
            unitId,
            subUnitId,
            formulaMap: {
                [formulaId]: {
                    f: formulaText,
                    ranges,
                },
            },
        };

        this._commandService.executeCommand(SetOtherFormulaMutation.id, params, { onlyLocal: true }).then(() => {
            this._commandService.executeCommand(ConditionalFormattingFormulaMarkDirty.id, { [unitId]: { [subUnitId]: { [formulaId]: true } } }, { onlyLocal: true });
        });
    }

    private _removeFormulaByCfId(unitId: string, subUnitId: string, cfId: string) {
        const values = this.deleteCache(unitId, subUnitId, cfId);
        const formulaIdList = values.map((item) => item.formulaId);
        this._commandService.executeCommand(RemoveOtherFormulaMutation.id, { unitId, subUnitId, formulaIdList } as IRemoveOtherFormulaMutationParams, { onlyLocal: true });
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
        if (FormulaResultStatus.SUCCESS === item.status && item.result) {
            const result = item.result.getValue(row, col);
            return { result, status: FormulaResultStatus.SUCCESS };
        }

        if (item.status === FormulaResultStatus.WAIT) {
            return { status: FormulaResultStatus.WAIT };
        }

        return { status: FormulaResultStatus.ERROR };
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
        if (FormulaResultStatus.SUCCESS === item.status && item.result) {
            const result = item.result;
            return { result, status: FormulaResultStatus.SUCCESS };
        }
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
     * The external environment is not aware of`formulaId`;it communicates internally with the formula engine.
     */
    private _createFormulaId(unitId: string, subUnitId: string) {
        return `sheet.cf_${unitId}_${subUnitId}_${Tools.generateRandomId(8)}`;
    }

    /**
     * A conditional formatting may have multiple formulas;if the formulas are identical,then the results will be consistent.
     */
    public createCFormulaId(cfId: string, formulaText: string) {
        return `${cfId}_${formulaText}`;
    }
}
