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
import { ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { SetDrawingSelectedOperation } from '@univerjs/drawing';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { COMPONENT_SHEET_DRAWING_PANEL } from '../../../views/sheet-image-panel/component-name';
import { SidebarSheetDrawingOperation } from '../open-drawing-panel.operation';

vi.mock('@univerjs/sheets', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets')>();
    return { ...actual, getSheetCommandTarget: vi.fn() };
});

const mockedGetSheetCommandTarget = vi.mocked(getSheetCommandTarget);

function createAccessor() {
    const sidebarService = { open: vi.fn(), close: vi.fn() };
    const commandService = { syncExecuteCommand: vi.fn() };
    const accessor = {
        get(token: unknown) {
            if (token === ISidebarService) return sidebarService;
            if (token === LocaleService) return { t: (key: string) => key };
            if (token === IUniverInstanceService) return {};
            if (token === ICommandService) return commandService;
            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return { accessor, sidebarService, commandService };
}

describe('SidebarSheetDrawingOperation', () => {
    it('opens the sheet drawing panel and clears the selection on close', async () => {
        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'book-1', subUnitId: 'sheet-1' } as never);
        const { accessor, sidebarService, commandService } = createAccessor();

        await expect(SidebarSheetDrawingOperation.handler(accessor, { value: 'open' })).resolves.toBe(true);
        expect(sidebarService.open).toHaveBeenCalledWith(expect.objectContaining({
            header: { title: 'sheetImage.panel.title' },
            children: { label: COMPONENT_SHEET_DRAWING_PANEL },
            width: 360,
        }));
        const onClose = sidebarService.open.mock.calls[0][0].onClose;
        onClose();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, []);
    });

    it('returns false without a sheet target and closes on non-open actions', async () => {
        const { accessor, sidebarService } = createAccessor();
        mockedGetSheetCommandTarget.mockReturnValue(null as never);
        await expect(SidebarSheetDrawingOperation.handler(accessor, { value: 'open' })).resolves.toBe(false);

        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'book-1', subUnitId: 'sheet-1' } as never);
        await expect(SidebarSheetDrawingOperation.handler(accessor, { value: 'close' })).resolves.toBe(true);
        expect(sidebarService.close).toHaveBeenCalledTimes(1);
    });
});
