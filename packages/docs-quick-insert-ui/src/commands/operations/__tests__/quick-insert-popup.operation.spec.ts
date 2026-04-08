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

import { Injector } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocQuickInsertPopupService } from '../../../services/doc-quick-insert-popup.service';
import { CloseQuickInsertPopupOperation, ShowQuickInsertPopupOperation } from '../quick-insert-popup.operation';

function createAccessor(bindings: Array<[unknown, unknown]>) {
    const injector = new Injector();

    bindings.forEach(([token, value]) => {
        injector.add([token as never, { useValue: value }]);
    });

    return injector as never;
}

describe('quick insert popup operations', () => {
    it('shows a popup only when parameters are provided', () => {
        const showPopup = vi.fn();
        const accessor = createAccessor([
            [DocQuickInsertPopupService, { showPopup }],
        ]);
        const params = {
            unitId: 'doc-1',
            index: 3,
            popup: {
                keyword: '/',
                menus$: { subscribe: vi.fn() },
            },
        } as never;

        expect(ShowQuickInsertPopupOperation.handler(accessor, undefined)).toBe(false);
        expect(ShowQuickInsertPopupOperation.handler(accessor, params)).toBe(true);
        expect(showPopup).toHaveBeenCalledWith(params);
    });

    it('closes the active popup session', () => {
        const closePopup = vi.fn();
        const accessor = createAccessor([
            [DocQuickInsertPopupService, { closePopup }],
        ]);

        expect(CloseQuickInsertPopupOperation.handler(accessor)).toBe(true);
        expect(closePopup).toHaveBeenCalledTimes(1);
    });
});
