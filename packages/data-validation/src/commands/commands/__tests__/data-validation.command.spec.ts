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
import {
    DataValidatorRegistryScope,
    DataValidatorRegistryService,
} from '../../../services/data-validator-registry.service';
import {
    AddDataValidationMutation,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
} from '../../mutations/data-validation.mutation';
import {
    AddDataValidationCommand,
    RemoveAllDataValidationCommand,
    RemoveDataValidationCommand,
    removeDataValidationUndoFactory,
    UpdateDataValidationOptionsCommand,
    UpdateDataValidationSettingCommand,
} from '../data-validation.command';

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

describe('deprecated data validation commands', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let dataValidationModel: DataValidationModel;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DataValidationModel]);
        injector.add([DataValidatorRegistryService]);

        commandService = injector.get(ICommandService);
        [
            AddDataValidationMutation,
            RemoveDataValidationMutation,
            UpdateDataValidationMutation,
            AddDataValidationCommand,
            RemoveDataValidationCommand,
            RemoveAllDataValidationCommand,
            UpdateDataValidationOptionsCommand,
            UpdateDataValidationSettingCommand,
        ].forEach((command) => commandService.registerCommand(command));

        injector.get(DataValidatorRegistryService).register({
            id: DataValidationType.TEXT_LENGTH,
            title: 'Text length',
            operators: [DataValidationOperator.GREATER_THAN],
            scopes: DataValidatorRegistryScope.SHEET,
            order: 0,
            validatorFormula: () => ({ success: true }),
            normalizeFormula: (rule: ISheetDataValidationRule) => ({
                formula1: rule.formula1,
                formula2: rule.formula2,
            }),
        } as never);

        dataValidationModel = injector.get(DataValidationModel);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds a rule through the command and stores undo that removes it', async () => {
        const result = await commandService.executeCommand(AddDataValidationCommand.id, {
            unitId,
            subUnitId,
            rule: {
                ...createRule('rule-1'),
                range: { startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 },
            },
            index: 0,
        });

        expect(result).toBe(true);
        expect(dataValidationModel.getRuleById(unitId, subUnitId, 'rule-1')?.ranges).toEqual([
            { startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 },
        ]);
    });

    it('updates rule options and criteria with reversible mutations', async () => {
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId,
            subUnitId,
            rule: createRule('rule-1'),
        });

        expect(await commandService.executeCommand(UpdateDataValidationOptionsCommand.id, {
            unitId,
            subUnitId,
            ruleId: 'rule-1',
            options: {
                allowBlank: false,
                showErrorMessage: false,
                prompt: 'Use more text',
            },
        })).toBe(true);

        expect(await commandService.executeCommand(UpdateDataValidationSettingCommand.id, {
            unitId,
            subUnitId,
            ruleId: 'rule-1',
            setting: {
                type: DataValidationType.TEXT_LENGTH,
                operator: DataValidationOperator.GREATER_THAN,
                formula1: '3',
                formula2: undefined,
                allowBlank: true,
            },
        })).toBe(true);

        expect(dataValidationModel.getRuleById(unitId, subUnitId, 'rule-1')).toMatchObject({
            type: DataValidationType.TEXT_LENGTH,
            operator: DataValidationOperator.GREATER_THAN,
            formula1: '3',
            formula2: undefined,
            allowBlank: true,
            showErrorMessage: false,
            prompt: 'Use more text',
        });
    });

    it('removes one rule or all rules and records add mutations for undo', async () => {
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId,
            subUnitId,
            rule: [createRule('rule-1'), createRule('rule-2')],
        });

        expect(await commandService.executeCommand(RemoveDataValidationCommand.id, {
            unitId,
            subUnitId,
            ruleId: 'rule-1',
        })).toBe(true);
        expect(dataValidationModel.getRules(unitId, subUnitId).map((rule) => rule.uid)).toEqual(['rule-2']);

        expect(await commandService.executeCommand(RemoveAllDataValidationCommand.id, { unitId, subUnitId })).toBe(true);
        expect(dataValidationModel.getRules(unitId, subUnitId)).toEqual([]);
    });

    it('rebuilds batch remove undo mutations from the rules that existed before deletion', async () => {
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId,
            subUnitId,
            rule: [
                createRule('rule-1', { formula1: '1' }),
                createRule('rule-2', { formula1: '5' }),
            ],
        });

        const [undo] = removeDataValidationUndoFactory(univer.__getInjector(), {
            unitId,
            subUnitId,
            ruleId: ['rule-1', 'rule-2', 'missing-rule'],
            source: 'command',
        });

        expect(undo).toMatchObject({
            id: AddDataValidationMutation.id,
            params: {
                unitId,
                subUnitId,
                source: 'command',
                rule: [
                    { uid: 'rule-1', formula1: '1' },
                    { uid: 'rule-2', formula1: '5' },
                ],
            },
        });
    });

    it('does not mutate rules when parameters or target rules are missing', async () => {
        expect(await commandService.executeCommand(AddDataValidationCommand.id)).toBe(false);
        expect(await commandService.executeCommand(RemoveDataValidationCommand.id)).toBe(false);
        expect(await commandService.executeCommand(RemoveAllDataValidationCommand.id)).toBe(false);
        expect(await commandService.executeCommand(UpdateDataValidationOptionsCommand.id)).toBe(false);
        expect(await commandService.executeCommand(UpdateDataValidationSettingCommand.id)).toBe(false);

        expect(await commandService.executeCommand(UpdateDataValidationOptionsCommand.id, {
            unitId,
            subUnitId,
            ruleId: 'missing',
            options: { prompt: 'Ignored' },
        })).toBe(false);
        expect(await commandService.executeCommand(UpdateDataValidationSettingCommand.id, {
            unitId,
            subUnitId,
            ruleId: 'missing',
            setting: {
                type: DataValidationType.TEXT_LENGTH,
                operator: DataValidationOperator.GREATER_THAN,
                formula1: '3',
            },
        })).toBe(false);
        expect(dataValidationModel.getRules(unitId, subUnitId)).toEqual([]);
    });
});
