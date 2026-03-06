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

import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DEFINED_NAME_CONTAINER } from '../../../views/defined-name/component-name';
import { SidebarDefinedNameOperation } from '../sidebar-defined-name.operation';

vi.mock('@univerjs/sheets', () => ({
    getSheetCommandTarget: vi.fn(),
}));

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

describe('SidebarDefinedNameOperation', () => {
    it('returns false when there is no sheet command target', async () => {
        vi.mocked(getSheetCommandTarget).mockReturnValue(null as any);
        const open = vi.fn();
        const close = vi.fn();
        const accessor = createAccessor([
            [ISidebarService, { open, close }],
            [IEditorService, {}],
            [LocaleService, { t: vi.fn(() => 'Defined Name') }],
            [IUniverInstanceService, {}],
        ]);

        await expect(SidebarDefinedNameOperation.handler(accessor, { value: 'open' } as any)).resolves.toBe(false);
        expect(open).not.toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
    });

    it('opens sidebar with localized title when value is open', async () => {
        vi.mocked(getSheetCommandTarget).mockReturnValue({ unitId: 'u1', subUnitId: 's1' } as any);
        const open = vi.fn();
        const close = vi.fn();
        const accessor = createAccessor([
            [ISidebarService, { open, close }],
            [IEditorService, {}],
            [LocaleService, { t: vi.fn(() => 'Defined Name') }],
            [IUniverInstanceService, {}],
        ]);

        await expect(SidebarDefinedNameOperation.handler(accessor, { value: 'open' } as any)).resolves.toBe(true);
        expect(open).toHaveBeenCalledWith(expect.objectContaining({
            id: DEFINED_NAME_CONTAINER,
            width: 333,
            header: { title: 'Defined Name' },
            children: { label: DEFINED_NAME_CONTAINER },
        }));
        expect(close).not.toHaveBeenCalled();
    });

    it('closes sidebar for close/default action', async () => {
        vi.mocked(getSheetCommandTarget).mockReturnValue({ unitId: 'u1', subUnitId: 's1' } as any);
        const close = vi.fn();
        const accessor = createAccessor([
            [ISidebarService, { open: vi.fn(), close }],
            [IEditorService, {}],
            [LocaleService, { t: vi.fn(() => 'Defined Name') }],
            [IUniverInstanceService, {}],
        ]);

        await expect(SidebarDefinedNameOperation.handler(accessor, { value: 'close' } as any)).resolves.toBe(true);
        expect(close).toHaveBeenCalledTimes(1);

        await expect(SidebarDefinedNameOperation.handler(accessor, { value: 'other' } as any)).resolves.toBe(true);
        expect(close).toHaveBeenCalledTimes(2);
    });
});
