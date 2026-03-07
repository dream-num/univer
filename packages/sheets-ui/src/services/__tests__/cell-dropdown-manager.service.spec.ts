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

import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { dropdownMap } from '../../views/dropdown';
import { SheetCellDropdownManagerService } from '../cell-dropdown-manager.service';

function createParam() {
    return {
        location: {
            row: 1,
            col: 2,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            workbook: {},
            worksheet: {},
        },
        type: 'list',
        props: {
            options: [{ label: 'A', value: 'a' }],
        },
    } as any;
}

describe('SheetCellDropdownManagerService', () => {
    it('registers dropdown components and closes popup through outside click/hideFn', () => {
        const popupDisposable = { dispose: vi.fn() };
        const attachPopupToCell: any = vi.fn(() => popupDisposable);
        const componentManager = {
            register: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const canvas = { id: 'canvas' } as any;
        const renderManager = {
            getRenderById: vi.fn((unitId: string) => {
                if (unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                    return {
                        engine: {
                            getCanvasElement: () => canvas,
                        },
                    };
                }
                return null;
            }),
        };

        const service = new SheetCellDropdownManagerService(
            { attachPopupToCell } as any,
            { visible: false } as any,
            renderManager as any,
            componentManager as any
        );

        expect(componentManager.register).toHaveBeenCalledTimes(Object.keys(dropdownMap).length);

        const onHide = vi.fn();
        const disposable = service.showDropdown({
            ...createParam(),
            onHide,
        });
        const popupConfig: any = attachPopupToCell.mock.calls[0][2];
        expect(attachPopupToCell).toHaveBeenCalledWith(
            1,
            2,
            expect.objectContaining({
                offset: [0, 3],
                excludeOutside: [canvas],
            }),
            'unit-1',
            'sheet-1'
        );

        popupConfig.onClickOutside();
        expect(popupDisposable.dispose).toHaveBeenCalled();
        expect(onHide).toHaveBeenCalled();

        const disposable2 = service.showDropdown({
            ...createParam(),
            closeOnOutSide: false,
            onHide,
        });
        const popupConfig2: any = attachPopupToCell.mock.calls[1][2];
        popupConfig2.onClickOutside();
        expect(popupDisposable.dispose).toHaveBeenCalledTimes(1);
        popupConfig2.extraProps.hideFn();
        expect(popupDisposable.dispose).toHaveBeenCalledTimes(2);

        disposable.dispose();
        disposable2.dispose();
    });

    it('throws when zen mode is visible or popup cannot be attached', () => {
        const commonArgs = [
            { attachPopupToCell: vi.fn() },
            { getRenderById: vi.fn(() => null) },
            { register: vi.fn(() => ({ dispose: vi.fn() })) },
        ] as const;

        const zenVisibleService = new SheetCellDropdownManagerService(
            commonArgs[0] as any,
            { visible: true } as any,
            commonArgs[1] as any,
            commonArgs[2] as any
        );
        expect(() => zenVisibleService.showDropdown(createParam())).toThrowError('cannot show dropdown when zen mode is visible');

        const attachFailService = new SheetCellDropdownManagerService(
            { attachPopupToCell: vi.fn(() => null) } as any,
            { visible: false } as any,
            commonArgs[1] as any,
            commonArgs[2] as any
        );
        expect(() => attachFailService.showDropdown(createParam())).toThrowError('cannot show dropdown');
    });
});
