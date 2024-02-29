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

import { ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import type { DataValidationType, IDataValidationRuleBase, IRange, ISheetDataValidationRule } from '@univerjs/core';
import type { IUpdateDataValidationCommandParams } from '@univerjs/data-validation';
import { DataValidatorRegistryScope, DataValidatorRegistryService, RemoveDataValidationCommand, UpdateDataValidationCommand, UpdateRuleType } from '@univerjs/data-validation';
import { TWO_FORMULA_OPERATOR_COUNT } from '@univerjs/data-validation/types/const/two-formula-operators.js';
import { Button, Select } from '@univerjs/design';
import { ComponentManager } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';

export interface IDataValidationDetailProps {
    rule: ISheetDataValidationRule;
    onClose: () => void;
}

const stringifyRange = (range: IRange) => {
    const { startRow, startColumn, endColumn, endRow } = range;

    return `[${startRow},${startColumn}][${endRow},${endColumn}]`;
};

export function DataValidationDetail(props: IDataValidationDetailProps) {
    const { rule, onClose } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const worksheet = workbook.getActiveSheet();
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const validatorService = useDependency(DataValidatorRegistryService);
    const validator = validatorService.getValidatorItem(rule.type);
    const componentManager = useDependency(ComponentManager);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [localRule, setLocalRule] = useState(rule);

    const rules = validatorService.getValidatorsByScope(DataValidatorRegistryScope.SHEET);
    if (!validator) {
        return null;
    }
    const operators = validator.operators;
    const operatorNames = validator.operatorNames;

    const handleUpdateRuleRanges = (ranges: IRange[]) => {
        setLocalRule({
            ...localRule,
            ranges,
        });

        const params: IUpdateDataValidationCommandParams = {
            unitId,
            subUnitId,
            ruleId: rule.uid,
            payload: {
                type: UpdateRuleType.RANGE,
                payload: ranges,
            },
        };

        commandService.executeCommand(UpdateDataValidationCommand.id, params);
    };

    const handleUpdateRuleSetting = (setting: IDataValidationRuleBase) => {
        setLocalRule({
            ...localRule,
            ...setting,
        });

        const params: IUpdateDataValidationCommandParams = {
            unitId,
            subUnitId,
            ruleId: rule.uid,
            payload: {
                type: UpdateRuleType.SETTING,
                payload: setting,
            },
        };

        commandService.executeCommand(UpdateDataValidationCommand.id, params);
    };

    const handleDelete = async () => {
        await commandService.executeCommand(RemoveDataValidationCommand.id, {
            ruleId: rule.uid,
            unitId,
            subUnitId,
        });
        onClose();
    };

    const baseRule = {
        type: rule.type,
        operator: rule.operator,
        formula1: rule.formula1,
        formula2: rule.formula2,
        allowBlank: rule.allowBlank,
    };

    const handleChange = (newType: string) => {
        setLocalRule({
            ...localRule,
            type: newType as DataValidationType,
        });
    };

    const FormulaInput = componentManager.get(validator.formulaInput);

    return (
        <div>
            <div>Range</div>
            {rule.ranges.map((range, i) => (
                <div key={i}>
                    {stringifyRange(range)}
                </div>
            ))}
            <div>type</div>
            <Select
                options={rules?.map((rule) => ({
                    label: localeService.t(rule.title),
                    value: rule.id,
                }))}
                value={rule.type}
                onChange={handleChange}
            />
            <div>operator</div>
            <Select
                options={operators.map((op, i) => ({
                    value: `${op}`,
                    label: operatorNames[i],
                }))}
                value={`${rule.operator}`}
                onChange={(operator) => {
                    handleUpdateRuleSetting({
                        ...baseRule,
                        operator: +operator,
                    });
                }}
            />
            <div>formula</div>
            {FormulaInput
                ? (
                    <FormulaInput
                        value={{
                            formula1: rule.formula1,
                            formula2: rule.formula2,
                        }}
                        onChange={(value: any) => {
                            handleUpdateRuleSetting({
                                ...baseRule,
                                ...value,
                            });
                        }}
                    />
                )
                : null}

            <div>advance options</div>
            <div>
                <Button onClick={handleDelete}>
                    Remove Rule
                </Button>
                <Button type="primary" onClick={onClose}>
                    Done
                </Button>
            </div>
        </div>
    );
}
