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

import type { ILogService, Injector, ISheetDataValidationRule, IWorkbookData, Workbook } from '@univerjs/core';
import {
    DataValidationOperator,
    DataValidationType,
    ICommandService,
    IResourceLoaderService,
    IResourceManagerService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddDataValidationMutation, RemoveDataValidationMutation, UpdateDataValidationMutation } from '../commands/mutations/data-validation.mutation';
import { DataValidationResourceController } from '../controllers/dv-resource.controller';
import { DataValidationModel } from '../models/data-validation-model';
import { UpdateRuleType } from '../types/enum/update-rule-type';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'unit-1',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Workbook',
        sheetOrder: ['sheet-1', 'sheet-2'],
        styles: {},
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                cellData: {},
            },
            'sheet-2': {
                id: 'sheet-2',
                name: 'Sheet2',
                cellData: {},
            },
        },
    };
}

function createRule(uid: string, overrides: Partial<ISheetDataValidationRule> = {}): ISheetDataValidationRule {
    return {
        uid,
        type: DataValidationType.DECIMAL,
        operator: DataValidationOperator.BETWEEN,
        formula1: '1',
        formula2: '5',
        allowBlank: true,
        showErrorMessage: true,
        error: `Rule ${uid} failed`,
        ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        ...overrides,
    } as ISheetDataValidationRule;
}

describe('data validation integration', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let resourceManagerService: IResourceManagerService;
    let resourceLoaderService: IResourceLoaderService;
    let dataValidationModel: DataValidationModel;

    beforeEach(() => {
        univer = new Univer();

        const injector = univer.__getInjector();
        get = injector.get.bind(injector);

        injector.add([DataValidationModel]);
        injector.add([DataValidationResourceController]);

        commandService = get(ICommandService);
        commandService.registerCommand(AddDataValidationMutation);
        commandService.registerCommand(RemoveDataValidationMutation);
        commandService.registerCommand(UpdateDataValidationMutation);

        dataValidationModel = get(DataValidationModel);
        resourceManagerService = get(IResourceManagerService);
        resourceLoaderService = get(IResourceLoaderService);

        get(DataValidationResourceController);
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    });

    afterEach(() => {
        univer.dispose();
    });

    it('applies add, update, and remove mutations through the real command service', async () => {
        const changes: Array<{ type: string; ruleId: string; source: string }> = [];
        const sub = dataValidationModel.ruleChange$.subscribe((change) => {
            changes.push({ type: change.type, ruleId: change.rule.uid, source: change.source });
        });

        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: createRule('rule-1'),
        });

        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            index: 0,
            rule: [createRule('rule-2'), createRule('rule-1'), createRule('rule-3')],
        });

        await commandService.executeCommand(UpdateDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ruleId: 'rule-1',
            payload: {
                type: UpdateRuleType.SETTING,
                payload: {
                    type: DataValidationType.TEXT_LENGTH,
                    operator: DataValidationOperator.GREATER_THAN,
                    formula1: '3',
                    formula2: undefined,
                    allowBlank: false,
                },
            },
        });

        await commandService.executeCommand(UpdateDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ruleId: 'rule-1',
            payload: {
                type: UpdateRuleType.OPTIONS,
                payload: {
                    prompt: 'Type a longer value',
                    promptTitle: 'Length rule',
                    showErrorMessage: false,
                    bizInfo: {
                        source: 'integration-spec',
                    },
                },
            },
        });

        await commandService.executeCommand(UpdateDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ruleId: 'rule-2',
            payload: {
                type: UpdateRuleType.RANGE,
                payload: [{ startRow: 2, endRow: 3, startColumn: 1, endColumn: 2 }],
            },
        });

        await commandService.executeCommand(UpdateDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ruleId: 'rule-3',
            payload: {
                type: UpdateRuleType.ALL,
                payload: createRule('rule-3', {
                    type: DataValidationType.LIST,
                    operator: undefined,
                    formula1: 'Yes,No',
                    formula2: undefined,
                    showDropDown: false,
                    ranges: [{ startRow: 4, endRow: 4, startColumn: 0, endColumn: 1 }],
                }),
            },
        });

        await commandService.executeCommand(RemoveDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ruleId: ['rule-2', 'rule-3'],
        });

        const rules = dataValidationModel.getRules('unit-1', 'sheet-1');
        expect(rules.map((rule) => rule.uid)).toEqual(['rule-1']);
        expect(dataValidationModel.getRuleIndex('unit-1', 'sheet-1', 'rule-1')).toBe(0);
        expect(dataValidationModel.getRuleById('unit-1', 'sheet-1', 'rule-1')).toMatchObject({
            type: DataValidationType.TEXT_LENGTH,
            operator: DataValidationOperator.GREATER_THAN,
            formula1: '3',
            allowBlank: false,
            prompt: 'Type a longer value',
            promptTitle: 'Length rule',
            showErrorMessage: false,
            bizInfo: {
                source: 'integration-spec',
            },
        });

        expect(changes.map((change) => change.type)).toEqual([
            'add',
            'add',
            'add',
            'update',
            'update',
            'update',
            'update',
            'remove',
            'remove',
        ]);
        expect(changes.every((change) => change.source === 'command')).toBe(true);

        sub.unsubscribe();
    });

    it('serializes, unloads, and loads rule resources through the resource manager', async () => {
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: createRule('sheet-1-rule'),
        });
        await commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-2',
            rule: createRule('sheet-2-rule', {
                ranges: [{ startRow: 9, endRow: 9, startColumn: 0, endColumn: 0 }],
            }),
        });

        const snapshot = resourceLoaderService.saveUnit('unit-1');
        const resource = snapshot?.resources.find((item) => item.name === 'SHEET_DATA_VALIDATION_PLUGIN');

        expect(resource).toBeDefined();
        expect(JSON.parse(resource!.data)).toEqual({
            'sheet-1': [createRule('sheet-1-rule')],
            'sheet-2': [createRule('sheet-2-rule', {
                ranges: [{ startRow: 9, endRow: 9, startColumn: 0, endColumn: 0 }],
            })],
        });

        resourceManagerService.unloadResources('unit-1', UniverInstanceType.UNIVER_SHEET);
        expect(dataValidationModel.getUnitRules('unit-1')).toEqual([]);

        resourceManagerService.loadResources('unit-1', [{
            name: 'SHEET_DATA_VALIDATION_PLUGIN',
            data: JSON.stringify({
                'sheet-1': [createRule('loaded-rule')],
                'sheet-2': [createRule('loaded-rule-2', {
                    type: DataValidationType.LIST,
                    formula1: 'A,B',
                    operator: undefined,
                })],
            }),
        }]);

        expect(dataValidationModel.getRules('unit-1', 'sheet-1')).toEqual([createRule('loaded-rule')]);
        expect(dataValidationModel.getRules('unit-1', 'sheet-2')).toEqual([
            createRule('loaded-rule-2', {
                type: DataValidationType.LIST,
                formula1: 'A,B',
                operator: undefined,
            }),
        ]);

        resourceManagerService.loadResources('unit-1', [{
            name: 'SHEET_DATA_VALIDATION_PLUGIN',
            data: '{invalid-json',
        }]);

        expect(dataValidationModel.getSubUnitIds('unit-1')).toEqual(['sheet-1', 'sheet-2']);
    });

    it('reports model errors and exposes unit level getters without changing source code', () => {
        const logService = {
            error: vi.fn(),
        } as unknown as ILogService;
        const model = new DataValidationModel(logService);

        model.addRule('unit-2', 'sheet-x', createRule('rule-a'), 'patched');
        model.addRule('unit-2', 'sheet-y', createRule('rule-b'), 'patched');

        expect(model.getSubUnitIds('unit-2')).toEqual(['sheet-x', 'sheet-y']);
        expect(model.getUnitRules('unit-2')).toEqual([
            ['sheet-x', [createRule('rule-a')]],
            ['sheet-y', [createRule('rule-b')]],
        ]);
        expect(model.getAll()).toContainEqual([
            'unit-2',
            [
                ['sheet-x', [createRule('rule-a')]],
                ['sheet-y', [createRule('rule-b')]],
            ],
        ]);

        model.updateRule('unit-2', 'sheet-x', 'missing-rule', {
            type: UpdateRuleType.ALL,
            payload: createRule('missing-rule'),
        }, 'patched');

        expect(logService.error).toHaveBeenCalled();

        model.deleteUnitRules('unit-2');
        expect(model.getUnitRules('unit-2')).toEqual([]);
        model.dispose();
    });
});
