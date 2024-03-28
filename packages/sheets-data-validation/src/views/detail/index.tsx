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

import type { DataValidationOperator, IDataValidationRuleBase, IDataValidationRuleOptions, ISheetDataValidationRule, IUnitRange } from '@univerjs/core';
import { DataValidationType, ICommandService, isValidRange, LocaleService } from '@univerjs/core';
import type { IUpdateDataValidationSettingCommandParams } from '@univerjs/data-validation';
import { DataValidatorRegistryScope, DataValidatorRegistryService, RemoveDataValidationCommand, UpdateDataValidationOptionsCommand, UpdateDataValidationSettingCommand } from '@univerjs/data-validation';
import { TWO_FORMULA_OPERATOR_COUNT } from '@univerjs/data-validation/types/const/two-formula-operators.js';
import { Button, FormLayout, Select } from '@univerjs/design';
import { ComponentManager, RangeSelector, useEvent, useObservable } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';
import { serializeRange } from '@univerjs/engine-formula';
import { getRuleOptions, getRuleSetting } from '@univerjs/data-validation/common/util.js';
import { DataValidationPanelService } from '@univerjs/data-validation/services/data-validation-panel.service.js';
import type { IUpdateSheetDataValidationRangeCommandParams } from '../../commands/commands/data-validation.command';
import { UpdateSheetDataValidationRangeCommand } from '../../commands/commands/data-validation.command';
import { DataValidationOptions } from '../options';
import styles from './index.module.less';

export function DataValidationDetail() {
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const activeRuleInfo = useObservable(dataValidationPanelService.activeRule$, dataValidationPanelService.activeRule)!;
    const { unitId, subUnitId, rule } = activeRuleInfo || {};
    const validatorService = useDependency(DataValidatorRegistryService);
    const componentManager = useDependency(ComponentManager);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [localRule, setLocalRule] = useState<ISheetDataValidationRule>(rule);
    const validator = validatorService.getValidatorItem(localRule.type);
    const [showError, setShowError] = useState(false);
    const validators = validatorService.getValidatorsByScope(DataValidatorRegistryScope.SHEET);
    const [localeRanges, setLocalRanges] = useState<IUnitRange[]>(() => localRule.ranges.map((i) => ({ unitId: '', sheetId: '', range: i })));

    if (!validator) {
        return null;
    }

    const operators = validator.operators;
    const operatorNames = validator.operatorNames;
    const isTwoFormula = localRule.operator ? TWO_FORMULA_OPERATOR_COUNT.includes(localRule.operator) : false;

    const handleOk = () => {
        if (validator.validatorFormula(localRule).success) {
            dataValidationPanelService.setActiveRule(null);
        } else {
            setShowError(true);
        }
    };

    const handleUpdateRuleRanges = useEvent((unitRanges: IUnitRange[]) => {
        setLocalRanges(unitRanges);
        const ranges = unitRanges.filter((i) => (!i.unitId || i.unitId === unitId) && (!i.sheetId || i.sheetId === subUnitId)).map((i) => i.range);

        setLocalRule({
            ...localRule,
            ranges,
        });
        const params: IUpdateSheetDataValidationRangeCommandParams = {
            unitId,
            subUnitId,
            ruleId: rule.uid,
            ranges,
        };

        commandService.executeCommand(UpdateSheetDataValidationRangeCommand.id, params);
    });

    const handleUpdateRuleSetting = (setting: IDataValidationRuleBase) => {
        setLocalRule({
            ...localRule,
            ...setting,
        });

        const params: IUpdateDataValidationSettingCommandParams = {
            unitId,
            subUnitId,
            ruleId: rule.uid,
            setting,
        };

        commandService.executeCommand(UpdateDataValidationSettingCommand.id, params);
    };

    const handleDelete = async () => {
        await commandService.executeCommand(RemoveDataValidationCommand.id, {
            ruleId: rule.uid,
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

        const newRule = {
            ...localRule,
            type: newType as DataValidationType,
            operator: operators[0],
            ...(newType === DataValidationType.CHECKBOX
                ? {
                    formula1: undefined,
                    formula2: undefined,
                }
                : null),
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
    const rangeStr = localeRanges.map((i) => serializeRange(i.range)).join(',');

    const options: IDataValidationRuleOptions = getRuleOptions(localRule);

    const handleUpdateRuleOptions = (newOptions: IDataValidationRuleOptions) => {
        setLocalRule({
            ...localRule,
            ...newOptions,
        });

        commandService.executeCommand(UpdateDataValidationOptionsCommand.id, {
            unitId,
            subUnitId,
            ruleId: rule.uid,
            options: newOptions,
        });
    };

    return (
        <div>
            <FormLayout label={localeService.t('dataValidation.panel.range')}>
                <RangeSelector
                    className={styles.dataValidationDetailFormItem}
                    value={rangeStr}
                    id="data-validation-detail"
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
                        validResult={validator.validatorFormula(localRule)}
                        unitId={unitId}
                        subUnitId={subUnitId}
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
