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

import type { DataValidationOperator, DataValidationType, IDataValidationRuleBase, IDataValidationRuleOptions, IExecutionOptions, ISheetDataValidationRule, IUnitRange, Workbook } from '@univerjs/core';
import type { IUpdateSheetDataValidationRangeCommandParams } from '@univerjs/sheets-data-validation';
import type { IRangeSelectorInstance } from '@univerjs/sheets-formula-ui';
import { debounce, ICommandService, isUnitRangesEqual, IUniverInstanceService, LocaleService, RedoCommand, shallowEqual, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryScope, DataValidatorRegistryService, getRuleOptions, getRuleSetting, TWO_FORMULA_OPERATOR_COUNT } from '@univerjs/data-validation';
import { Button, Checkbox, FormLayout, Select } from '@univerjs/design';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { RemoveSheetDataValidationCommand, UpdateSheetDataValidationOptionsCommand, UpdateSheetDataValidationRangeCommand, UpdateSheetDataValidationSettingCommand } from '@univerjs/sheets-data-validation';
import { RangeSelector } from '@univerjs/sheets-formula-ui';
import { ComponentManager, useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { DataValidationOptions } from '../options';

// debounce execute commands, for better redo-undo experience
const debounceExecuteFactory = (commandService: ICommandService) => debounce(
    async (id: string, params?: any, options?: IExecutionOptions | undefined, callback?: (success: boolean) => void) => {
        const res = await commandService.executeCommand(id, params, options);
        callback?.(res);
    },
    1000
);
function getSheetIdByName(univerInstanceService: IUniverInstanceService, unitId: string, name: string) {
    if (unitId) {
        return univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetName(name)?.getSheetId() || '';
    }
    return univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetName(name)?.getSheetId() || '';
}

export function DataValidationDetail() {
    const [key, setKey] = useState(0);
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const activeRuleInfo = useObservable(dataValidationPanelService.activeRule$, dataValidationPanelService.activeRule)!;
    const { unitId, subUnitId, rule } = activeRuleInfo || {};
    const ruleId = rule.uid;
    const validatorService = useDependency(DataValidatorRegistryService);
    const univerInstanceService = useDependency(IUniverInstanceService);
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
    const [isRangeError, setIsRangeError] = useState(false);
    const [isFocusRangeSelector, isFocusRangeSelectorSet] = useState(false);
    const rangeSelectorInstance = useRef<IRangeSelectorInstance>(null);
    const sheetSelectionService = useDependency(SheetsSelectionsService);

    useEffect(() => {
        return () => {
            const currentSelection = sheetSelectionService.getCurrentLastSelection();
            if (currentSelection) {
                sheetSelectionService.setSelections([currentSelection]);
            }
        };
    }, [sheetSelectionService]);

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
        if (rangeSelectorInstance.current?.editor?.isFocus()) {
            handleUpdateRuleRanges(rangeSelectorInstance.current?.getValue());
        }
        if (!localRule.ranges.length || isRangeError) {
            return;
        }

        if (validator.validatorFormula(localRule, unitId, subUnitId).success) {
            dataValidationPanelService.setActiveRule(null);
        } else {
            setShowError(true);
        }
    };

    const handleUpdateRuleRanges = useEvent((rangeText: string) => {
        const unitRanges = rangeText.split(',').filter(Boolean).map(deserializeRangeWithSheet).map((unitRange) => {
            const sheetName = unitRange.sheetName;
            if (sheetName) {
                const sheetId = getSheetIdByName(univerInstanceService, unitRange.unitId, sheetName);
                return { ...unitRange, sheetId };
            }
            return {
                ...unitRange,
                sheetId: '',
            };
        });
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
        const params = {
            unitId,
            subUnitId,
            ruleId,
            setting,
        };

        debounceExecute(
            UpdateSheetDataValidationSettingCommand.id,
            params,
            undefined
        );
    };

    const handleDelete = async () => {
        await commandService.executeCommand(RemoveSheetDataValidationCommand.id, {
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
        const newRule = (newType === rule?.type || (newType.includes('list') && rule?.type.includes('list')))
            ? {
                ...rule,
                type: newType as DataValidationType,
            }
            : {
                ...localRule,
                type: newType as DataValidationType,
                operator: operators[0],
                formula1: undefined,
                formula2: undefined,
            };
        setLocalRule(newRule);

        commandService.executeCommand(UpdateSheetDataValidationSettingCommand.id, {
            unitId,
            subUnitId,
            ruleId: localRule.uid,
            setting: getRuleSetting(newRule),
        });
    };

    const FormulaInput = componentManager.get(validator.formulaInput!);
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
            UpdateSheetDataValidationOptionsCommand.id,
            {
                unitId,
                subUnitId,
                ruleId,
                options: newOptions,
            }
        );
    };

    const shouldHideFormula = operators.length && !localRule.operator;

    return (
        <div className="univer-py-4">
            <FormLayout
                label={localeService.t('dataValidation.panel.range')}
                error={(!localRule.ranges.length || isRangeError) ? localeService.t('dataValidation.panel.rangeError') : ''}
            >
                <RangeSelector
                    selectorRef={rangeSelectorInstance}
                    unitId={unitId}
                    subUnitId={subUnitId}
                    initialValue={rangeStr}
                    onChange={(doc, str) => {
                        if (!isFocusRangeSelector && rangeSelectorInstance.current?.verify()) {
                            handleUpdateRuleRanges(str);
                        }
                    }}
                    onFocusChange={(focusing, str) => {
                        isFocusRangeSelectorSet(focusing);
                        if (!focusing && str && rangeSelectorInstance.current?.verify()) {
                            handleUpdateRuleRanges(str);
                        }
                    }}
                    onVerify={(isValid) => setIsRangeError(!isValid)}
                />
            </FormLayout>
            <FormLayout label={localeService.t('dataValidation.panel.type')}>
                <Select
                    className="univer-w-full"
                    value={localRule.type}
                    options={validators?.sort((a, b) => a.order - b.order)?.map((validator) => ({
                        label: localeService.t(validator.title),
                        value: validator.id,
                    }))}
                    onChange={handleChangeType}
                />
            </FormLayout>
            {operators?.length
                ? (
                    <FormLayout label={localeService.t('dataValidation.panel.operator')}>
                        <Select
                            className="univer-w-full"
                            value={`${localRule.operator}`}
                            options={[
                                {
                                    value: '',
                                    label: localeService.t('dataValidation.operators.legal'),
                                },
                                ...operators.map((op, i) => ({
                                    value: `${op}`,
                                    label: operatorNames[i],
                                })),
                            ]}
                            onChange={(operator) => {
                                handleUpdateRuleSetting({
                                    ...baseRule,
                                    operator: operator as DataValidationOperator,
                                });
                            }}
                        />
                    </FormLayout>
                )
                : null}
            {FormulaInput && !shouldHideFormula
                ? (
                    <FormulaInput
                        key={key + localRule.type}
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
            <FormLayout>
                <Checkbox
                    checked={(localRule.allowBlank ?? true)}
                    onChange={() => handleUpdateRuleSetting({
                        ...baseRule,
                        allowBlank: !(localRule.allowBlank ?? true),
                    })}
                >
                    {localeService.t('dataValidation.panel.allowBlank')}
                </Checkbox>
            </FormLayout>
            <DataValidationOptions value={options} onChange={handleUpdateRuleOptions} extraComponent={validator.optionsInput} />
            <div className="univer-mt-5 univer-flex univer-flex-row univer-justify-end">
                <Button className="univer-ml-3" onClick={handleDelete}>
                    {localeService.t('dataValidation.panel.removeRule')}
                </Button>
                <Button className="univer-ml-3" variant="primary" onClick={handleOk}>
                    {localeService.t('dataValidation.panel.done')}
                </Button>
            </div>
        </div>
    );
}
