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

import type { IMutationInfo, ISheetDataValidationRule, Workbook } from '@univerjs/core';
import type { EffectRefRangeParams, IClearSelectionAllCommandParams } from '@univerjs/sheets';
import {
    generateRandomId,
    Inject,
    Injector,
    IUniverInstanceService,
    RxDisposable,
    toDisposable,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AddDataValidationMutation,
    DataValidatorRegistryService,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
    UpdateRuleType,
} from '@univerjs/data-validation';
import {
    ClearSelectionAllCommand,
    EffectRefRangId,
    getSheetCommandTarget,
    MoveRangeCommand,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { getDataValidationDiffMutations } from '../commands/commands/data-validation.command';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { shouldOffsetFormulaByRange } from '../utils/formula';
import { AnyValidator } from '../validators/any-validator';
import { CheckboxValidator } from '../validators/checkbox-validator';
import { CustomFormulaValidator } from '../validators/custom-validator';
import { DateValidator } from '../validators/date-validator';
import { DecimalValidator } from '../validators/decimal-validator';
import { ListMultipleValidator } from '../validators/list-multiple-validator';
import { ListValidator } from '../validators/list-validator';
import { TextLengthValidator } from '../validators/text-length-validator';
import { WholeValidator } from '../validators/whole-validator';

export class DataValidationController extends RxDisposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetsSelectionsService) private _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(FormulaRefRangeService) private readonly _formulaRefRangeService: FormulaRefRangeService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._registerValidators();
        this._initCommandInterceptor();
    }

    private _registerValidators(): void {
        ([
            AnyValidator,
            DecimalValidator,
            WholeValidator,
            TextLengthValidator,
            DateValidator,
            CheckboxValidator,
            ListValidator,
            ListMultipleValidator,
            CustomFormulaValidator,
        ]).forEach((Validator) => {
            const validator = this._injector.createInstance(Validator as typeof ListValidator);
            this.disposeWithMe(this._dataValidatorRegistryService.register(validator));
            this.disposeWithMe(toDisposable(() => this._injector.delete(Validator as typeof ListValidator)));
        });
    }

    private _initCommandInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (commandInfo) => {
                if (commandInfo.id === MoveRangeCommand.id) {
                    return this._getMoveMutations(commandInfo as EffectRefRangeParams);
                }
                if (commandInfo.id === ClearSelectionAllCommand.id) {
                    const params = commandInfo.params as IClearSelectionAllCommandParams | undefined;
                    const target = getSheetCommandTarget(this._univerInstanceService, params);
                    if (!target) {
                        return { undos: [], redos: [] };
                    }
                    const { unitId, subUnitId } = target;
                    const selections = params?.ranges || this._selectionManagerService.getCurrentSelections()?.map((s) => s.range);

                    const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();

                    if (selections) {
                        ruleMatrix.removeRange(selections);
                    }
                    const diffs = ruleMatrix.diff(this._sheetDataValidationModel.getRules(unitId, subUnitId));
                    const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, this._injector, 'patched');

                    return {
                        undos: undoMutations,
                        redos: redoMutations,
                    };
                }

                return {
                    undos: [],
                    redos: [],
                };
            },
        }));
    }

    private _getMoveMutations(commandInfo: EffectRefRangeParams) {
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const restores: IMutationInfo[] = [];
        if (commandInfo.id !== EffectRefRangId.MoveRangeCommandId || !commandInfo.params) {
            return { redos, undos };
        }
        const { fromUnitId, toUnitId, fromSubUnitId, toSubUnitId } = commandInfo.params;
        if (!fromUnitId || fromUnitId !== toUnitId || !fromSubUnitId || fromSubUnitId === toSubUnitId) {
            return { redos, undos };
        }
        const owners = new Map<string, { unitId: string; subUnitId: string; oldRules: ISheetDataValidationRule[]; rules: ISheetDataValidationRule[] }>();
        const getOwner = (unitId: string, subUnitId: string) => {
            const key = JSON.stringify([unitId, subUnitId]);
            let owner = owners.get(key);
            if (!owner) {
                owner = { unitId, subUnitId, oldRules: Tools.deepClone(this._sheetDataValidationModel.getRules(unitId, subUnitId)), rules: [] };
                owners.set(key, owner);
            }
            return owner;
        };
        for (const [unitId, sheets] of this._sheetDataValidationModel.getAll()) {
            if (!this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)) {
                continue;
            }
            for (const [subUnitId, rules] of sheets) {
                getOwner(unitId, subUnitId);
                for (const rule of rules) {
                    const changes = this._formulaRefRangeService.getRangeFormulaChanges(
                        unitId,
                        subUnitId,
                        rule.ranges,
                        [rule.formula1 ?? '', rule.formula2 ?? ''],
                        commandInfo,
                        shouldOffsetFormulaByRange(rule.type, this._dataValidatorRegistryService)
                    );
                    let retained = false;
                    for (const change of changes) {
                        const target = getOwner(change.unitId, change.subUnitId);
                        let uid = rule.uid;
                        if (change.moved) {
                            uid = `${subUnitId}-${rule.uid}`;
                            if (target.oldRules.some((item) => item.uid === uid)) {
                                uid = generateRandomId();
                            }
                        } else if (retained) {
                            uid = generateRandomId();
                        }
                        if (!change.moved) {
                            retained = true;
                        }
                        if (target.rules.some((item) => item.uid === uid)) {
                            uid = generateRandomId();
                        }
                        target.rules.push({
                            ...rule,
                            uid,
                            ranges: change.ranges,
                            formula1: rule.formula1 === undefined && !change.formulas[0] ? undefined : change.formulas[0],
                            formula2: rule.formula2 === undefined && !change.formulas[1] ? undefined : change.formulas[1],
                        });
                    }
                }
            }
        }
        for (const { unitId, subUnitId, oldRules, rules } of owners.values()) {
            for (let index = 0; index < oldRules.length; index++) {
                const oldRule = oldRules[index];
                const rule = rules.find((item) => item.uid === oldRule.uid);
                if (!rule) {
                    redos.push({ id: RemoveDataValidationMutation.id, params: { unitId, subUnitId, ruleId: oldRule.uid, source: 'patched' } });
                    restores.push({ id: AddDataValidationMutation.id, params: { unitId, subUnitId, rule: oldRule, index, source: 'patched' } });
                } else if (!Tools.diffValue(oldRule, rule)) {
                    redos.push({ id: UpdateDataValidationMutation.id, params: {
                        unitId,
                        subUnitId,
                        ruleId: rule.uid,
                        payload: { type: UpdateRuleType.ALL, payload: rule },
                        source: 'patched',
                    } });
                    undos.unshift({ id: UpdateDataValidationMutation.id, params: {
                        unitId,
                        subUnitId,
                        ruleId: oldRule.uid,
                        payload: { type: UpdateRuleType.ALL, payload: oldRule },
                        source: 'patched',
                    } });
                }
            }
            for (const rule of rules) {
                if (!oldRules.some((item) => item.uid === rule.uid)) {
                    redos.push({ id: AddDataValidationMutation.id, params: { unitId, subUnitId, rule, source: 'patched' } });
                    undos.unshift({ id: RemoveDataValidationMutation.id, params: { unitId, subUnitId, ruleId: rule.uid, source: 'patched' } });
                }
            }
        }
        // Remove new fragments first, then insert original rules in ascending index order.
        return { redos, undos: [...undos, ...restores] };
    }
}
