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

import type { IAccessor } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { AddSheetDataValidationCommand, createDefaultNewRule } from '@univerjs/sheets-data-validation';
import { describe, expect, it, vi } from 'vitest';
import { OpenValidationPanelOperation } from '../../operations/data-validation.operation';
import { AddSheetDataValidationAndOpenCommand } from '../data-validation-ui.command';

vi.mock('@univerjs/sheets', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets')>();
    return { ...actual, getSheetCommandTarget: vi.fn() };
});

vi.mock('@univerjs/sheets-data-validation', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets-data-validation')>();
    return { ...actual, createDefaultNewRule: vi.fn() };
});

const mockedGetSheetCommandTarget = vi.mocked(getSheetCommandTarget);
const mockedCreateDefaultNewRule = vi.mocked(createDefaultNewRule);

function createAccessor() {
    const commandService = { syncExecuteCommand: vi.fn(() => true) };
    const accessor = {
        get(token: unknown) {
            if (token === IUniverInstanceService) {
                return {};
            }

            if (token === ICommandService) {
                return commandService;
            }

            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return { accessor, commandService };
}

describe('AddSheetDataValidationAndOpenCommand', () => {
    it('adds a default rule for the current sheet and opens the panel for that rule', () => {
        mockedCreateDefaultNewRule.mockReturnValue({ uid: 'rule-1' } as never);
        mockedGetSheetCommandTarget.mockReturnValue({
            workbook: { getUnitId: () => 'book-1' },
            worksheet: { getSheetId: () => 'sheet-1' },
        } as never);
        const { accessor, commandService } = createAccessor();

        expect(AddSheetDataValidationAndOpenCommand.handler(accessor)).toBe(true);
        expect(mockedCreateDefaultNewRule).toHaveBeenCalledWith(accessor);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(1, AddSheetDataValidationCommand.id, {
            rule: { uid: 'rule-1' },
            unitId: 'book-1',
            subUnitId: 'sheet-1',
        });
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(2, OpenValidationPanelOperation.id, {
            ruleId: 'rule-1',
            isAdd: true,
        });
    });

    it('returns false when there is no active target or adding the rule fails', () => {
        const { accessor, commandService } = createAccessor();
        mockedCreateDefaultNewRule.mockReturnValue({ uid: 'rule-2' } as never);
        mockedGetSheetCommandTarget.mockReturnValue(null as never);
        expect(AddSheetDataValidationAndOpenCommand.handler(accessor)).toBe(false);

        mockedGetSheetCommandTarget.mockReturnValue({
            workbook: { getUnitId: () => 'book-1' },
            worksheet: { getSheetId: () => 'sheet-1' },
        } as never);
        commandService.syncExecuteCommand.mockReturnValue(false);
        expect(AddSheetDataValidationAndOpenCommand.handler(accessor)).toBe(false);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledTimes(1);
    });
});
