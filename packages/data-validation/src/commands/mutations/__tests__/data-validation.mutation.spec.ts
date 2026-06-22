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

import type { ISheetDataValidationRule } from '@univerjs/core';
import { DataValidationOperator, DataValidationType, ICommandService, Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DataValidationModel } from '../../../models/data-validation-model';
import { UpdateRuleType } from '../../../types/enum/update-rule-type';
import {
    AddDataValidationMutation,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
} from '../data-validation.mutation';

const unitId = 'validation-workbook';
const subUnitId = 'validation-sheet';

function createRule(uid: string, overrides: Partial<ISheetDataValidationRule> = {}): ISheetDataValidationRule {
    return {
        uid,
        type: DataValidationType.DECIMAL,
        operator: DataValidationOperator.BETWEEN,
        formula1: '1',
        formula2: '10',
        allowBlank: true,
        showErrorMessage: true,
        ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        ...overrides,
    } as ISheetDataValidationRule;
}

describe('data validation mutations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let dataValidationModel: DataValidationModel;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DataValidationModel]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(AddDataValidationMutation);
        commandService.registerCommand(UpdateDataValidationMutation);
        commandService.registerCommand(RemoveDataValidationMutation);
        dataValidationModel = injector.get(DataValidationModel);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('keeps validation rules in user-defined order while ignoring duplicate rule ids', async () => {
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId,
            subUnitId,
            rule: createRule('rule-1'),
        });
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId,
            subUnitId,
            index: 0,
            rule: [createRule('rule-2'), createRule('rule-1'), createRule('rule-3')],
        });

        const ruleIds: string[] = [];
        for (const rule of dataValidationModel.getRules(unitId, subUnitId)) {
            ruleIds.push(rule.uid);
        }

        expect(ruleIds).toEqual(['rule-2', 'rule-3', 'rule-1']);
        expect(dataValidationModel.getRuleIndex(unitId, subUnitId, 'rule-1')).toBe(2);
    });

    it('updates validation behavior and removes obsolete rules from the worksheet', async () => {
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId,
            subUnitId,
            rule: [
                createRule('keep-rule'),
                createRule('remove-rule'),
            ],
        });

        await commandService.executeCommand(UpdateDataValidationMutation.id, {
            unitId,
            subUnitId,
            ruleId: 'keep-rule',
            payload: {
                type: UpdateRuleType.ALL,
                payload: createRule('keep-rule', {
                    type: DataValidationType.TEXT_LENGTH,
                    operator: DataValidationOperator.GREATER_THAN,
                    formula1: '3',
                    formula2: undefined,
                    allowBlank: false,
                    prompt: 'Enter at least four characters',
                    promptTitle: 'Length check',
                    ranges: [{ startRow: 2, endRow: 4, startColumn: 1, endColumn: 1 }],
                }),
            },
        });
        await commandService.executeCommand(RemoveDataValidationMutation.id, {
            unitId,
            subUnitId,
            ruleId: 'remove-rule',
        });

        expect(dataValidationModel.getRuleById(unitId, subUnitId, 'remove-rule')).toBeUndefined();
        expect(dataValidationModel.getRuleById(unitId, subUnitId, 'keep-rule')).toMatchObject({
            type: DataValidationType.TEXT_LENGTH,
            operator: DataValidationOperator.GREATER_THAN,
            formula1: '3',
            formula2: undefined,
            allowBlank: false,
            prompt: 'Enter at least four characters',
            promptTitle: 'Length check',
            ranges: [{ startRow: 2, endRow: 4, startColumn: 1, endColumn: 1 }],
        });
    });
});
