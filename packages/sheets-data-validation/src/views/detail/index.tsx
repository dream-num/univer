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

import type { DataValidationOperator, DataValidationType, IDataValidationRuleBase, IDataValidationRuleOptions, IExecutionOptions, ISheetDataValidationRule, IUnitRange } from '@univerjs/core';
import { createInternalEditorID, debounce, ICommandService, isUnitRangesEqual, isValidRange, LocaleService, RedoCommand, shallowEqual, UndoCommand } from '@univerjs/core';
import type { IUpdateDataValidationSettingCommandParams } from '@univerjs/data-validation';
import { DataValidationModel, DataValidatorRegistryScope, DataValidatorRegistryService, getRuleOptions, getRuleSetting, RemoveDataValidationCommand, TWO_FORMULA_OPERATOR_COUNT, UpdateDataValidationOptionsCommand, UpdateDataValidationSettingCommand } from '@univerjs/data-validation';
import { Button, FormLayout, Select } from '@univerjs/design';
import { ComponentManager, RangeSelector, useEvent, useObservable } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useMemo, useState } from 'react';
import { serializeRange } from '@univerjs/engine-formula';
import type { IUpdateSheetDataValidationRangeCommandParams } from '../../commands/commands/data-validation.command';
import { UpdateSheetDataValidationRangeCommand } from '../../commands/commands/data-validation.command';
import { DataValidationOptions } from '../options';
import { DataValidationPanelService } from '../../services/data-validation-panel.service';
import styles from './index.module.less';

// debounce execute commands, for better redo-undo experience
const debounceExecuteFactory = (commandService: ICommandService) => debounce(
    async (id: string, params?: any, options?: IExecutionOptions | undefined,
        callback?: (success: boolean) => void
    ) => {
        const res = await commandService.executeCommand(id, params, options);
        callback?.(res);
    }
    ,
    275
);

export function DataValidationDetail() {
    const [key, setKey] = useState(0);
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const activeRuleInfo = useObservable(dataValidationPanelService.activeRule$, dataValidationPanelService.activeRule)!;
    const { unitId, subUnitId, rule } = activeRuleInfo || {};
    const ruleId = rule.uid;
    const validatorService = useDependency(DataValidatorRegistryService);
    const componentManager = useDependency(ComponentManager);
    const commandService = useDependency(ICommandService);
    const dataValidationModel = useDependency(DataValidationModel);
    const localeService = useDependency(LocaleService);
    const [localRule, setLocalRule] = useState<ISheetDataValidationRule>(rule);
    const validator = validatorService.getValidatorItem(localRule.type);
    const [showError, setShowError] = useState(false);
    const validators = validatorService.getValidatorsByScope(DataValidatorRegistryScope.SHEET);
    const [localRanges, setLocalRanges] = useState<IUnitRange[]>(() => localRule.ranges.map((i) => ({ unitId: '', sheetId: '', range: i })));
    const debounceExecute = useMemo(() => debounceExecuteFactory(commandService), [commandService]);

    useEffect(() => {
        commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === UndoCommand.id || commandInfo.id === RedoCommand.id) {
                setTimeout(() => {
                    const activeRule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId) as ISheetDataValidationRule;
                    setKey((k) => k + 1);
                    if (activeRule) {
                        setLocalRule(activeRule);
                        setLocalRanges(activeRule.ranges.map((i) => ({ unitId: '', sheetId: '', range: i })));
                    }
                }, 20);
            }
        });
    }, [commandService, dataValidationModel, ruleId, subUnitId, unitId]);

    if (!validator) {
        return null;
    }

    const operators = validator.operators;
    const operatorNames = validator.operatorNames;
    const isTwoFormula = localRule.operator ? TWO_FORMULA_OPERATOR_COUNT.includes(localRule.operator) : false;

    const handleOk = () => {
        if (validator.validatorFormula(localRule, unitId, subUnitId).success) {
            dataValidationPanelService.setActiveRule(null);
        } else {
            setShowError(true);
        }
    };

    const handleUpdateRuleRanges = useEvent((unitRanges: IUnitRange[]) => {
        if (isUnitRangesEqual(unitRanges, localRanges)) {
            return;
        }
        setLocalRanges(unitRanges);
        const ranges = unitRanges.filter((i) => (!i.unitId || i.unitId === unitId) && (!i.sheetId || i.sheetId === subUnitId)).map((i) => i.range);
        setLocalRule({
            ...localRule,
            ranges,
        });

        if (ranges.length === 0) {
            return;
        }

        const params: IUpdateSheetDataValidationRangeCommandParams = {
            unitId,
            subUnitId,
            ruleId,
            ranges,
        };

        debounceExecute(UpdateSheetDataValidationRangeCommand.id, params);
    });

    const handleUpdateRuleSetting = (setting: IDataValidationRuleBase) => {
        if (shallowEqual(setting, getRuleSetting(localRule))) {
            return;
        }

        setLocalRule({
            ...localRule,
            ...setting,
        });
        const params: IUpdateDataValidationSettingCommandParams = {
            unitId,
            subUnitId,
            ruleId,
            setting,
        };

        debounceExecute(
            UpdateDataValidationSettingCommand.id,
            params,
            undefined
        );
    };

    const handleDelete = async () => {
        await commandService.executeCommand(RemoveDataValidationCommand.id, {
            ruleId,
            unitId,
            subUnitId,
        });
        dataValidationPanelService.setActiveRule(null);
    };

    const baseRule = {
        type: localRule.type,
        operator: localRule.operator,
        formula1: localRule.formula1,
        formula2: localRule.formula2,
        allowBlank: localRule.allowBlank,
    };

    const handleChangeType = (newType: string) => {
        const validator = validatorService.getValidatorItem(newType);
        if (!validator) {
            return;
        }

        const operators = validator.operators;
        const rule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
        const newRule = newType === rule?.type
            ? {
                ...rule,
            }
            : {
                ...localRule,
                type: newType as DataValidationType,
                operator: operators[0],
                formula1: undefined,
                formula2: undefined,
            };
        setLocalRule(newRule);

        commandService.executeCommand(UpdateDataValidationSettingCommand.id, {
            unitId,
            subUnitId,
            ruleId: localRule.uid,
            setting: getRuleSetting(newRule),
        });
    };

    const FormulaInput = componentManager.get(validator.formulaInput);
    const rangeStr = useMemo(() => localRanges.map((i) => serializeRange(i.range)).join(','), []);

    const options: IDataValidationRuleOptions = getRuleOptions(localRule);

    const handleUpdateRuleOptions = (newOptions: IDataValidationRuleOptions) => {
        if (shallowEqual(newOptions, getRuleOptions(localRule))) {
            return;
        }
        setLocalRule({
            ...localRule,
            ...newOptions,
        });

        debounceExecute(
            UpdateDataValidationOptionsCommand.id,
            {
                unitId,
                subUnitId,
                ruleId,
                options: newOptions,
            }
        );
    };
    return (
        <div>
            <FormLayout label={localeService.t('dataValidation.panel.range')}>
                <RangeSelector
                    key={key}
                    className={styles.dataValidationDetailFormItem}
                    value={rangeStr}
                    id={createInternalEditorID('data-validation-detail')}
                    openForSheetUnitId={unitId}
                    openForSheetSubUnitId={subUnitId}
                    onChange={(newRange) => {
                        if (newRange.some((i) => !isValidRange(i.range) || i.range.endColumn < i.range.startColumn || i.range.endRow < i.range.startRow)) {
                            return;
                        }

                        handleUpdateRuleRanges(newRange);
                    }}

                />
            </FormLayout>
            <FormLayout label={localeService.t('dataValidation.panel.type')}>
                <Select
                    options={validators?.map((validator) => ({
                        label: localeService.t(validator.title),
                        value: validator.id,
                    }))}
                    value={localRule.type}
                    onChange={handleChangeType}
                    className={styles.dataValidationDetailFormItem}
                />
            </FormLayout>
            {operators?.length
                ? (
                    <FormLayout label={localeService.t('dataValidation.panel.operator')}>
                        <Select
                            options={operators.map((op, i) => ({
                                value: `${op}`,
                                label: operatorNames[i],
                            }))}
                            value={`${localRule.operator}`}
                            onChange={(operator) => {
                                handleUpdateRuleSetting({
                                    ...baseRule,
                                    operator: operator as DataValidationOperator,
                                });
                            }}
                            className={styles.dataValidationDetailFormItem}
                        />
                    </FormLayout>
                )
                : null}
            {FormulaInput
                ? (
                    <FormulaInput
                        key={key}
                        isTwoFormula={isTwoFormula}
                        value={{
                            formula1: localRule.formula1,
                            formula2: localRule.formula2,
                        }}
                        onChange={(value: any) => {
                            handleUpdateRuleSetting({
                                ...baseRule,
                                ...value,
                            });
                        }}
                        showError={showError}
                        validResult={validator.validatorFormula(localRule, unitId, subUnitId)}
                        unitId={unitId}
                        subUnitId={subUnitId}
                        ruleId={ruleId}
                    />
                )
                : null}
            <DataValidationOptions value={options} onChange={handleUpdateRuleOptions} extraComponent={validator.optionsInput} />
            <div className={styles.dataValidationDetailButtons}>
                <Button className={styles.dataValidationDetailButton} onClick={handleDelete}>
                    {localeService.t('dataValidation.panel.removeRule')}
                </Button>
                <Button className={styles.dataValidationDetailButton} type="primary" onClick={handleOk}>
                    {localeService.t('dataValidation.panel.done')}
                </Button>
            </div>
        </div>
    );
}
