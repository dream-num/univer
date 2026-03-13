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
import { QuickInsertButton } from '../../menu';
import { DocQuickInsertUIController } from '../doc-quick-insert-ui.controller';

describe('DocQuickInsertUIController', () => {
    it('registers commands, components and the built-in slash popup', () => {
        const registerCommand = vi.fn(() => ({ dispose: vi.fn() }));
        const register = vi.fn(() => ({ dispose: vi.fn() }));
        const unregisterPopup = vi.fn();
        const registerPopup = vi.fn(() => unregisterPopup);

        const controller = new DocQuickInsertUIController(
            { registerCommand } as never,
            { registerPopup } as never,
            { register } as never
        );

        expect(registerCommand).toHaveBeenCalledTimes(3);
        expect(register).toHaveBeenCalledWith(QuickInsertButton.componentKey, QuickInsertButton);
        expect(registerPopup).toHaveBeenCalledTimes(1);

        const firstRegisterPopupCall = registerPopup.mock.calls[0] as unknown[] | undefined;
        expect(firstRegisterPopupCall).toBeDefined();

        const slashPopup = firstRegisterPopupCall?.[0] as unknown as {
            keyword: string;
            preconditions: (params: { range: { startNodePosition?: { glyph?: number } } }) => boolean;
        };
        expect(slashPopup.keyword).toBe('/');
        expect(slashPopup.preconditions({ range: { startNodePosition: { glyph: 0 } } })).toBe(true);
        expect(slashPopup.preconditions({ range: { startNodePosition: { glyph: 2 } } })).toBe(false);

        controller.dispose();
        expect(unregisterPopup).toHaveBeenCalledTimes(1);
    });
});
