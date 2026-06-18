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

import { describe, expect, it, vi } from 'vitest';
import { SheetCellImageAutofillController } from '../sheet-cell-image-autofill.controller';
import { resizeImageByCell } from '../sheet-cell-image.controller';

vi.mock('../sheet-cell-image.controller', () => ({
    resizeImageByCell: vi.fn(),
}));

describe('SheetCellImageAutofillController', () => {
    it('registers an autofill hook that resizes every pasted cell image by its target cell', () => {
        let hook: any;
        const disposable = { dispose: vi.fn() };
        const autoFillService = {
            addHook: vi.fn((registeredHook) => {
                hook = registeredHook;
                return disposable;
            }),
        };
        const injector = { id: 'injector' };
        const controller = new SheetCellImageAutofillController(autoFillService as any, injector as any);
        const location = { unitId: 'unit-1', subUnitId: 'sheet-1' };
        const cellA = { p: { drawingsOrder: ['a'] } };
        const cellB = { p: { drawingsOrder: ['b'] } };

        hook.onBeforeSubmit(location, 'down', 'copy', {
            2: {
                3: cellA,
                4: cellB,
            },
        });

        expect(autoFillService.addHook).toHaveBeenCalledWith(expect.objectContaining({
            id: 'sheet-cell-image-autofill',
            onBeforeSubmit: expect.any(Function),
        }));
        expect(resizeImageByCell).toHaveBeenCalledWith(injector, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 2,
            col: 3,
        }, cellA);
        expect(resizeImageByCell).toHaveBeenCalledWith(injector, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 2,
            col: 4,
        }, cellB);

        controller.dispose();
        expect(disposable.dispose).toHaveBeenCalled();
    });
});
