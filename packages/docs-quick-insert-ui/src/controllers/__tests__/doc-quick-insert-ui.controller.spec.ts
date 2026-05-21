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
import { DocQuickInsertUIController } from '../doc-quick-insert-ui.controller';

describe('DocQuickInsertUIController', () => {
    it('should register the slash popup with correct keyword and preconditions', () => {
        const popups: any[] = [];
        const registerPopup = vi.fn((popup) => {
            popups.push(popup);
            return () => {
                const idx = popups.indexOf(popup);
                if (idx > -1) popups.splice(idx, 1);
            };
        });

        const controller = new DocQuickInsertUIController(
            { registerCommand: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            { registerPopup } as never,
            { register: vi.fn(() => ({ dispose: vi.fn() })) } as never
        );

        const slashPopup = popups.find((p) => p.keyword === '/');
        expect(slashPopup).toBeTruthy();
        expect(slashPopup.preconditions({ range: { startNodePosition: { glyph: 0 } } })).toBe(true);
        expect(slashPopup.preconditions({ range: { startNodePosition: { glyph: 2 } } })).toBe(false);

        controller.dispose();
    });

    it('should clean up registered popups on dispose', () => {
        const unregisterFns: Array<() => void> = [];
        const registerPopup = vi.fn(() => {
            const fn = vi.fn();
            unregisterFns.push(fn);
            return fn;
        });

        const controller = new DocQuickInsertUIController(
            { registerCommand: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            { registerPopup } as never,
            { register: vi.fn(() => ({ dispose: vi.fn() })) } as never
        );

        expect(unregisterFns.length).toBeGreaterThan(0);
        controller.dispose();

        for (const fn of unregisterFns) {
            expect(fn).toHaveBeenCalledTimes(1);
        }
    });
});
