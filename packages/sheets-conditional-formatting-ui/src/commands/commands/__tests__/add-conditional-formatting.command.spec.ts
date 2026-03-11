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

import type { IAccessor, IRange } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import {
    AddConditionalRuleMutation,
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    ConditionalFormattingRuleModel,
} from '@univerjs/sheets-conditional-formatting';
import { describe, expect, it, vi } from 'vitest';
import { AddAverageCfCommand } from '../add-average-cf.command';
import { AddColorScaleConditionalRuleCommand } from '../add-color-scale-cf.command';
import { AddDataBarConditionalRuleCommand } from '../add-data-bar-cf.command';
import { AddDuplicateValuesCfCommand } from '../add-duplicate-values-cf.command';
import { AddNumberCfCommand } from '../add-number-cf.command';
import { AddRankCfCommand } from '../add-rank-cf.command';
import { AddTextCfCommand } from '../add-text-cf.command';
import { AddTimePeriodCfCommand } from '../add-time-period-cf.command';
import { AddUniqueValuesCfCommand } from '../add-unique-values-cf.command';

vi.mock('@univerjs/sheets', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets')>();

    return {
        ...actual,
        getSheetCommandTarget: vi.fn(),
    };
});

const mockedGetSheetCommandTarget = vi.mocked(getSheetCommandTarget);

const range: IRange = {
    startRow: 1,
    endRow: 3,
    startColumn: 2,
    endColumn: 4,
};

function createAccessor() {
    const commandService = {
        executeCommand: vi.fn(() => true),
    };
    const conditionalFormattingRuleModel = {
        createCfId: vi.fn(() => 'cf-1'),
    };
    const univerInstanceService = {};

    const accessor = {
        get(token: unknown) {
            if (token === ICommandService) {
                return commandService;
            }

            if (token === ConditionalFormattingRuleModel) {
                return conditionalFormattingRuleModel;
            }

            if (token === IUniverInstanceService) {
                return univerInstanceService;
            }

            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return {
        accessor,
        commandService,
        conditionalFormattingRuleModel,
    };
}

describe('conditional formatting add commands', () => {
    it('creates highlight, scale, bar, and ranking rules from user input', () => {
        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'unit-1', subUnitId: 'sheet-1' } as never);

        const commandCases = [
            {
                command: AddAverageCfCommand,
                params: {
                    ranges: [range],
                    operator: 'aboveAverage',
                    style: { bg: { rgb: '#ffeecc' } },
                    stopIfTrue: true,
                },
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.average,
                    operator: 'aboveAverage',
                    style: { bg: { rgb: '#ffeecc' } },
                },
            },
            {
                command: AddColorScaleConditionalRuleCommand,
                params: {
                    ranges: [range],
                    config: [{ index: 0, color: '#f00' }, { index: 1, color: '#0f0' }],
                },
                rule: {
                    type: CFRuleType.colorScale,
                    config: [{ index: 0, color: '#f00' }, { index: 1, color: '#0f0' }],
                },
            },
            {
                command: AddDataBarConditionalRuleCommand,
                params: {
                    ranges: [range],
                    min: { type: 'min' },
                    max: { type: 'max' },
                    nativeColor: '#ddd',
                    positiveColor: '#0f0',
                    isGradient: true,
                    isShowValue: false,
                },
                rule: {
                    type: CFRuleType.dataBar,
                    isShowValue: false,
                    config: {
                        min: { type: 'min' },
                        max: { type: 'max' },
                        nativeColor: '#ddd',
                        positiveColor: '#0f0',
                        isGradient: true,
                    },
                },
            },
            {
                command: AddDuplicateValuesCfCommand,
                params: {
                    ranges: [range],
                    style: { cl: { rgb: '#f00' } },
                },
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.duplicateValues,
                    style: { cl: { rgb: '#f00' } },
                },
            },
            {
                command: AddRankCfCommand,
                params: {
                    ranges: [range],
                    style: { cl: { rgb: '#00f' } },
                    isPercent: true,
                    isBottom: false,
                    value: 10,
                },
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.rank,
                    style: { cl: { rgb: '#00f' } },
                    isPercent: true,
                    isBottom: false,
                    value: 10,
                },
            },
            {
                command: AddTextCfCommand,
                params: {
                    ranges: [range],
                    operator: 'containsText',
                    style: { bg: { rgb: '#ff0' } },
                    value: 'error',
                },
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.text,
                    operator: 'containsText',
                    style: { bg: { rgb: '#ff0' } },
                    value: 'error',
                },
            },
            {
                command: AddTimePeriodCfCommand,
                params: {
                    ranges: [range],
                    operator: 'yesterday',
                    style: { bg: { rgb: '#ccc' } },
                },
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.timePeriod,
                    operator: 'yesterday',
                    style: { bg: { rgb: '#ccc' } },
                },
            },
            {
                command: AddUniqueValuesCfCommand,
                params: {
                    ranges: [range],
                    style: { cl: { rgb: '#090' } },
                    stopIfTrue: true,
                },
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.uniqueValues,
                    style: { cl: { rgb: '#090' } },
                },
            },
        ];

        commandCases.forEach(({ command, params, rule }) => {
            const { accessor, commandService, conditionalFormattingRuleModel } = createAccessor();

            expect(command.handler(accessor, params as never)).toBe(true);
            expect(conditionalFormattingRuleModel.createCfId).toHaveBeenCalledWith('unit-1', 'sheet-1');
            expect(commandService.executeCommand).toHaveBeenCalledWith(AddConditionalRuleMutation.id, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                rule: {
                    ranges: [range],
                    cfId: 'cf-1',
                    stopIfTrue: Boolean((params as { stopIfTrue?: boolean }).stopIfTrue),
                    rule,
                },
            });
        });
    });

    it('supports both between and scalar number rules and rejects invalid inputs', () => {
        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'unit-1', subUnitId: 'sheet-1' } as never);

        const betweenAccessor = createAccessor();
        expect(AddNumberCfCommand.handler(betweenAccessor.accessor, {
            ranges: [range],
            operator: CFNumberOperator.between,
            style: { bg: { rgb: '#aaf' } },
            value: [10, 20],
            stopIfTrue: true,
        } as never)).toBe(true);
        expect(betweenAccessor.commandService.executeCommand).toHaveBeenCalledWith(AddConditionalRuleMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: {
                ranges: [range],
                cfId: 'cf-1',
                stopIfTrue: true,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    operator: CFNumberOperator.between,
                    style: { bg: { rgb: '#aaf' } },
                    value: [10, 20],
                },
            },
        });

        const scalarAccessor = createAccessor();
        expect(AddNumberCfCommand.handler(scalarAccessor.accessor, {
            ranges: [range],
            operator: CFNumberOperator.greaterThan,
            style: { cl: { rgb: '#222' } },
            value: 99,
        } as never)).toBe(true);
        expect(scalarAccessor.commandService.executeCommand).toHaveBeenCalledWith(AddConditionalRuleMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: {
                ranges: [range],
                cfId: 'cf-1',
                stopIfTrue: false,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    operator: CFNumberOperator.greaterThan,
                    style: { cl: { rgb: '#222' } },
                    value: 99,
                },
            },
        });

        const invalidBetweenAccessor = createAccessor();
        expect(AddNumberCfCommand.handler(invalidBetweenAccessor.accessor, {
            ranges: [range],
            operator: CFNumberOperator.between,
            style: {},
            value: [10],
        } as never)).toBe(false);
        expect(invalidBetweenAccessor.commandService.executeCommand).not.toHaveBeenCalled();

        const invalidScalarAccessor = createAccessor();
        expect(AddNumberCfCommand.handler(invalidScalarAccessor.accessor, {
            ranges: [range],
            operator: CFNumberOperator.lessThan,
            style: {},
            value: [1, 2],
        } as never)).toBe(false);
        expect(invalidScalarAccessor.commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('returns false when params are missing or no active sheet target exists', () => {
        const { accessor, commandService } = createAccessor();

        expect(AddAverageCfCommand.handler(accessor, null as never)).toBe(false);
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        mockedGetSheetCommandTarget.mockReturnValue(null as never);
        expect(AddUniqueValuesCfCommand.handler(accessor, {
            ranges: [range],
            style: {},
        } as never)).toBe(false);
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });
});
