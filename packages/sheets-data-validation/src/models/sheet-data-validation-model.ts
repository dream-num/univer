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

import type { DataValidationType, ISheetDataValidationRule } from '@univerjs/core';
import type { IRuleChange, IUpdateRulePayload } from '@univerjs/data-validation';
import type { IRemoveSheetMutationParams, ISheetLocation } from '@univerjs/sheets';
import { DataValidationStatus, Disposable, ICommandService, Inject, IUniverInstanceService } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService, UpdateRuleType } from '@univerjs/data-validation';
import { RemoveSheetMutation } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { DataValidationCacheService } from '../services/dv-cache.service';
import { DataValidationCustomFormulaService } from '../services/dv-custom-formula.service';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getCellValueOrigin } from '../utils/get-cell-data-origin';
import { RuleMatrix } from './rule-matrix';

export interface IValidStatusChange {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
    ruleId: string;
    status: DataValidationStatus;
}

export class SheetDataValidationModel extends Disposable {
    private readonly _ruleMatrixMap = new Map<string, Map<string, RuleMatrix>>();
    private readonly _validStatusChange$ = new Subject<IValidStatusChange>();
    private readonly _ruleChange$ = new Subject<IRuleChange>();

    readonly ruleChange$ = this._ruleChange$.asObservable();
    readonly validStatusChange$ = this._validStatusChange$.asObservable();

    constructor(
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(DataValidationCacheService) private _dataValidationCacheService: DataValidationCacheService,
        @Inject(DataValidationFormulaService) private _dataValidationFormulaService: DataValidationFormulaService,
        @Inject(DataValidationCustomFormulaService) private _dataValidationCustomFormulaService: DataValidationCustomFormulaService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initRuleUpdateListener();

        this.disposeWithMe(() => {
            this._ruleChange$.complete();
            this._validStatusChange$.complete();
        });

        this._initUniverInstanceListener();
    }

    private _initUniverInstanceListener() {
        this.disposeWithMe(
            this._univerInstanceService.unitDisposed$.subscribe((unit) => {
                this._ruleMatrixMap.delete(unit.getUnitId());
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (command.id === RemoveSheetMutation.id) {
                    const { unitId, subUnitId } = command.params as IRemoveSheetMutationParams;
                    const subUnitMap = this._ruleMatrixMap.get(unitId);
                    if (subUnitMap) {
                        subUnitMap.delete(subUnitId);
                    }
                }
            })
        );
    }

    private _initRuleUpdateListener() {
        const allRules = this._dataValidationModel.getAll();
        for (const [unitId, subUnitMap] of allRules) {
            for (const [subUnitId, rules] of subUnitMap) {
                for (const rule of rules) {
                    this._addRule(unitId, subUnitId, rule);

                    this._ruleChange$.next({
                        type: 'add',
                        unitId,
                        subUnitId,
                        rule,
                        source: 'patched',
                    });
                }
            }
        }

        this.disposeWithMe(
            this._dataValidationModel.ruleChange$.subscribe((ruleChange) => {
                switch (ruleChange.type) {
                    case 'add':
                        this._addRule(ruleChange.unitId, ruleChange.subUnitId, ruleChange.rule);
                        break;
                    case 'update':
                        this._updateRule(ruleChange.unitId, ruleChange.subUnitId, ruleChange.rule.uid, ruleChange.oldRule!, ruleChange.updatePayload!);
                        break;
                    case 'remove':
                        this._removeRule(ruleChange.unitId, ruleChange.subUnitId, ruleChange.rule);
                        break;
                }

                this._ruleChange$.next(ruleChange);
            })
        );
    }

    private _ensureRuleMatrix(unitId: string, subUnitId: string) {
        let unitMap = this._ruleMatrixMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._ruleMatrixMap.set(unitId, unitMap);
        }

        let matrix = unitMap.get(subUnitId);
        if (!matrix) {
            matrix = new RuleMatrix(new Map(), unitId, subUnitId, this._univerInstanceService);
            unitMap.set(subUnitId, matrix);
        }

        return matrix;
    }

    private _addRuleSideEffect(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const ruleMatrix = this._ensureRuleMatrix(unitId, subUnitId);
        ruleMatrix.addRule(rule);
        this._dataValidationCacheService.addRule(unitId, subUnitId, rule);
        this._dataValidationFormulaService.addRule(unitId, subUnitId, rule);
        this._dataValidationCustomFormulaService.addRule(unitId, subUnitId, rule);
    }

    private _addRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule | ISheetDataValidationRule[]): void {
        const rules = Array.isArray(rule) ? rule : [rule];

        rules.forEach((item) => {
            this._addRuleSideEffect(unitId, subUnitId, item);
        });
    }

    private _updateRule(unitId: string, subUnitId: string, ruleId: string, oldRule: ISheetDataValidationRule, payload: IUpdateRulePayload) {
        const ruleMatrix = this._ensureRuleMatrix(unitId, subUnitId);
        const newRule = {
            ...oldRule,
            ...payload.payload,
        };

        if (payload.type === UpdateRuleType.RANGE) {
            ruleMatrix.updateRange(ruleId, payload.payload);
        } else if (payload.type === UpdateRuleType.ALL) {
            ruleMatrix.updateRange(ruleId, payload.payload.ranges);
        }

        this._dataValidationCacheService.removeRule(unitId, subUnitId, oldRule);
        this._dataValidationCacheService.addRule(unitId, subUnitId, newRule);
        this._dataValidationFormulaService.removeRule(unitId, subUnitId, oldRule.uid);
        this._dataValidationFormulaService.addRule(unitId, subUnitId, newRule);
        this._dataValidationCustomFormulaService.deleteByRuleId(unitId, subUnitId, ruleId);
        this._dataValidationCustomFormulaService.addRule(unitId, subUnitId, newRule);
    }

    private _removeRule(unitId: string, subUnitId: string, oldRule: ISheetDataValidationRule): void {
        const ruleMatrix = this._ensureRuleMatrix(unitId, subUnitId);
        ruleMatrix.removeRule(oldRule);
        this._dataValidationCacheService.removeRule(unitId, subUnitId, oldRule);
        this._dataValidationCustomFormulaService.deleteByRuleId(unitId, subUnitId, oldRule.uid);
    }

    getValidator(type: DataValidationType | string) {
        return this._dataValidatorRegistryService.getValidatorItem(type);
    }

    getRuleIdByLocation(unitId: string, subUnitId: string, row: number, col: number): string | undefined {
        const ruleMatrix = this._ensureRuleMatrix(unitId, subUnitId);
        return ruleMatrix.getValue(row, col)!;
    }

    getRuleByLocation(unitId: string, subUnitId: string, row: number, col: number): ISheetDataValidationRule | undefined {
        const ruleId = this.getRuleIdByLocation(unitId, subUnitId, row, col);
        if (!ruleId) {
            return undefined;
        }

        return this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
    }

    validator(rule: ISheetDataValidationRule, pos: ISheetLocation, _onCompete?: (status: DataValidationStatus, changed: boolean) => void): DataValidationStatus {
        const { col, row, unitId, subUnitId, worksheet } = pos;
        const onCompete = (status: DataValidationStatus, changed: boolean) => {
            if (_onCompete) {
                _onCompete(status, changed);
            }
            if (changed) {
                this._validStatusChange$.next({
                    unitId,
                    subUnitId,
                    ruleId: rule.uid,
                    status,
                    row,
                    col,
                });
            }
        };

        const cell = worksheet.getCellValueOnly(row, col);
        const validator = this.getValidator(rule.type);
        const cellRaw = worksheet.getCellRaw(row, col);
        const cellValue = getCellValueOrigin(cellRaw);

        if (validator) {
            const cache = this._dataValidationCacheService.ensureCache(unitId, subUnitId);
            const current = cache.getValue(row, col);
            if (current === null || current === undefined) {
                cache.setValue(row, col, DataValidationStatus.VALIDATING);
                validator.validator(
                    {
                        value: cellValue,
                        unitId,
                        subUnitId,
                        row,
                        column: col,
                        worksheet: pos.worksheet,
                        workbook: pos.workbook,
                        interceptValue: getCellValueOrigin(cell),
                        t: cellRaw?.t,
                    },
                    rule
                ).then((status) => {
                    const realStatus = status ? DataValidationStatus.VALID : DataValidationStatus.INVALID;
                    const now = cache.getValue(row, col);
                    if (realStatus === DataValidationStatus.VALID) {
                        cache.realDeleteValue(row, col);
                    } else {
                        cache.setValue(row, col, realStatus);
                    }

                    onCompete(realStatus, current !== now);
                });
                return DataValidationStatus.VALIDATING;
            }

            onCompete(current ?? DataValidationStatus.VALID, false);
            return current ?? DataValidationStatus.VALID;
        } else {
            onCompete(DataValidationStatus.VALID, false);
            return DataValidationStatus.VALID;
        }
    }

    getRuleObjectMatrix(unitId: string, subUnitId: string) {
        return this._ensureRuleMatrix(unitId, subUnitId);
    }

    getRuleById(unitId: string, subUnitId: string, ruleId: string): ISheetDataValidationRule | undefined {
        return this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
    }

    getRuleIndex(unitId: string, subUnitId: string, ruleId: string) {
        return this._dataValidationModel.getRuleIndex(unitId, subUnitId, ruleId);
    }

    getRules(unitId: string, subUnitId: string): ISheetDataValidationRule[] {
        return [...this._dataValidationModel.getRules(unitId, subUnitId)];
    }

    getUnitRules(unitId: string): [string, ISheetDataValidationRule[]][] {
        return this._dataValidationModel.getUnitRules(unitId);
    }

    deleteUnitRules(unitId: string) {
        return this._dataValidationModel.deleteUnitRules(unitId);
    }

    getSubUnitIds(unitId: string) {
        return this._dataValidationModel.getSubUnitIds(unitId);
    }

    getAll() {
        return this._dataValidationModel.getAll();
    }
}
