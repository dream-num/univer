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
import type { IDataValidationDropdownParam } from '../../../services/dropdown-manager.service';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { DataValidationDropdownManagerService } from '../../../services/dropdown-manager.service';
import {
    CloseValidationPanelOperation,
    DATA_VALIDATION_PANEL,
    HideDataValidationDropdown,
    OpenValidationPanelOperation,
    ShowDataValidationDropdown,
    ToggleValidationPanelOperation,
} from '../data-validation.operation';

vi.mock('@univerjs/sheets', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets')>();
    return { ...actual, getSheetCommandTarget: vi.fn() };
});

const mockedGetSheetCommandTarget = vi.mocked(getSheetCommandTarget);

function createAccessor() {
    const commandService = { executeCommand: vi.fn() };
    const panelService = {
        open: vi.fn(),
        close: vi.fn(),
        setActiveRule: vi.fn(),
        setCloseDisposable: vi.fn(),
        isOpen: false,
    };
    const rule = { uid: 'rule-1' };
    const dropdownService: {
        activeDropdown: IDataValidationDropdownParam | null;
        showDataValidationDropdown: ReturnType<typeof vi.fn>;
        hideDropdown: ReturnType<typeof vi.fn>;
    } = {
        activeDropdown: null,
        showDataValidationDropdown: vi.fn(),
        hideDropdown: vi.fn(),
    };
    const sidebarService = {
        open: vi.fn(() => ({ dispose: vi.fn() })),
    };
    const accessor = {
        get(token: unknown) {
            if (token === ICommandService) return commandService;
            if (token === DataValidationPanelService) return panelService;
            if (token === DataValidationModel) return { getRuleById: vi.fn(() => rule) };
            if (token === IUniverInstanceService) return {};
            if (token === ISidebarService) return sidebarService;
            if (token === DataValidationDropdownManagerService) return dropdownService;
            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return { accessor, commandService, panelService, dropdownService, sidebarService, rule };
}

describe('data validation operations', () => {
    it('opens the validation panel for the active sheet rule and wires close disposal', () => {
        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'book-1', subUnitId: 'sheet-1' } as never);
        const { accessor, panelService, sidebarService, rule } = createAccessor();

        expect(OpenValidationPanelOperation.handler(accessor, { ruleId: 'rule-1', isAdd: true })).toBe(true);
        expect(panelService.open).toHaveBeenCalledTimes(1);
        expect(panelService.setActiveRule).toHaveBeenCalledWith({ unitId: 'book-1', subUnitId: 'sheet-1', rule });
        expect(sidebarService.open).toHaveBeenCalledWith(expect.objectContaining({
            id: DATA_VALIDATION_PANEL,
            header: { title: 'dataValidation.panel.addTitle' },
            children: { label: DATA_VALIDATION_PANEL },
            width: 312,
        }));
        expect(panelService.setCloseDisposable).toHaveBeenCalledTimes(1);
    });

    it('closes and toggles the panel through the command service', () => {
        const { accessor, panelService, commandService } = createAccessor();

        expect(CloseValidationPanelOperation.handler(accessor)).toBe(true);
        expect(panelService.close).toHaveBeenCalledTimes(1);

        panelService.isOpen = true;
        expect(ToggleValidationPanelOperation.handler(accessor)).toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(CloseValidationPanelOperation.id);

        panelService.isOpen = false;
        ToggleValidationPanelOperation.handler(accessor);
        expect(commandService.executeCommand).toHaveBeenCalledWith(OpenValidationPanelOperation.id);
    });

    it('shows and hides dropdowns only when location changes, and guards invalid params', () => {
        const { accessor, dropdownService } = createAccessor();

        expect(ShowDataValidationDropdown.handler(accessor, null as never)).toBe(false);
        expect(HideDataValidationDropdown.handler(accessor, null as never)).toBe(false);

        expect(ShowDataValidationDropdown.handler(accessor, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 1,
            column: 2,
        })).toBe(true);
        expect(dropdownService.showDataValidationDropdown).toHaveBeenCalledWith('book-1', 'sheet-1', 1, 2);

        dropdownService.activeDropdown = { location: { unitId: 'book-1', subUnitId: 'sheet-1', row: 1, col: 2 } } as unknown as IDataValidationDropdownParam;
        ShowDataValidationDropdown.handler(accessor, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 1,
            column: 2,
        });
        expect(dropdownService.showDataValidationDropdown).toHaveBeenCalledTimes(1);

        expect(HideDataValidationDropdown.handler(accessor, { ok: true } as never)).toBe(true);
        expect(dropdownService.hideDropdown).toHaveBeenCalledTimes(1);
    });

    it('returns false when there is no active sheet target or no params', () => {
        const { accessor, panelService } = createAccessor();
        mockedGetSheetCommandTarget.mockReturnValue(null as never);

        expect(OpenValidationPanelOperation.handler(accessor, { ruleId: 'rule-1' })).toBe(false);
        expect(OpenValidationPanelOperation.handler(accessor, null as never)).toBe(false);
        expect(panelService.open).not.toHaveBeenCalled();
    });
});
