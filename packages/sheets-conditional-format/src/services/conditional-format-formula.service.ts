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

import { Disposable, ICommandService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { SetFormulaCalculationResultMutation, SetOtherFormulaMutation } from '@univerjs/engine-formula';

interface IFormulaItem {
    formulaText: string;cfId: string;result?: boolean;status: 'end' | 'error' | 'wait';count: number;
};
export enum FormulaResultStatus {
    NOT_REGISTER = 1,
    SUCCESS,
    WAIT,
    ERROR,
}
export class ConditionalFormatFormulaService extends Disposable {
    private _formulaMap: Map<string, Map<string, Map<string, IFormulaItem>>> = new Map();
    private _cfMap: Map<string, Map<string, Map<string, Set<string>>>> = new Map();

    constructor(
        @Inject(ICommandService) private _commandService: ICommandService

    ) {
        super();
        this._initFormulaCalculationResultChange();
    }

    private _ensureSubunitFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map<string, Map<string, IFormulaItem>>();
            this._formulaMap.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    private _ensureSubunitCfMap(unitId: string, subUnitId: string) {
        let unitMap = this._cfMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map<string, Map<string, Set<string>>>();
            this._cfMap.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    private _initFormulaCalculationResultChange() {
        this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetFormulaCalculationResultMutation.id) {
                const params = commandInfo.params as ISetFormulaCalculationResultMutation;
                console.log('SetFormulaCalculationResultMutation', params);
            }
        });
    }

    getSubunitMap(unitId: string, subUnitId: string) {
        return this._formulaMap.get(unitId)?.get(subUnitId);
    }

    public registerFormula(unitId: string, subUnitId: string, cfId: string, formulaText: string) {
        const subUnitFormulaMap = this._ensureSubunitFormulaMap(unitId, subUnitId);
        const subUnitCfMap = this._ensureSubunitCfMap(unitId, subUnitId);
        const cfItem = subUnitCfMap.get(cfId);
        const formulaItem = subUnitFormulaMap.get(formulaText);
        if (cfItem) {
            cfItem.add(cfId);
        } else {
            const set = new Set<string>([formulaText]);
            subUnitCfMap.set(cfId, set);
        }
        if (formulaItem) {
            formulaItem.count++;
            return;
        }
        const formulaId = this._createFormulaId(unitId, subUnitId, formulaText);
        subUnitFormulaMap.set(formulaText, { formulaText, cfId, status: 'wait', count: 1 });
        this._commandService.executeCommand(SetOtherFormulaMutation.id, { item: { f: formulaText }, unitId, subUnitId, formulaId });
    }

    public removeFormula(unitId: string, subUnitId: string, cfId: string, formulaText?: string) {
        const subUnitFormulaMap = this._ensureSubunitFormulaMap(unitId, subUnitId);
        const subUnitCfMap = this._ensureSubunitCfMap(unitId, subUnitId);
        const reduceCount = (formulaText: string) => {
            const formulaItem = subUnitFormulaMap.get(formulaText);
            if (formulaItem) {
                formulaItem.count--;
                if (formulaItem.count <= 0) {
                    subUnitFormulaMap.delete(formulaText);
                }
            }
        };
        if (formulaText) {
            reduceCount(formulaText);
            const set = subUnitCfMap.get(cfId);
            set && set.delete(formulaText);
        } else {
            const set = subUnitCfMap.get(cfId);
            if (set) {
                set.forEach((formulaText) => {
                    reduceCount(formulaText);
                });
                subUnitCfMap.delete(cfId);
            }
        }
    }

    public getFormulaResult(unitId: string, subUnitId: string, formulaText: string) {
        const map = this.getSubunitMap(unitId, subUnitId);
        if (!map) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        const item = map.get(formulaText);
        if (!item) {
            return { status: FormulaResultStatus.NOT_REGISTER };
        }
        if (item.status === 'end') {
            return { result: item.result, status: FormulaResultStatus.SUCCESS };
        }
        if (item.status === 'wait') {
            return { status: FormulaResultStatus.WAIT };
        }
        if (item.status === 'error') {
            return { status: FormulaResultStatus.ERROR };
        }
    }

    _createFormulaId(unitId: string, subUnitId: string, formulaText: string) {
        return `sheet.cf_${unitId}_${subUnitId}_${formulaText}`;
    }
}
