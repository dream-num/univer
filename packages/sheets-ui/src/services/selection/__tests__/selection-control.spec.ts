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

import type { ThemeService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { SelectionControl } from '../selection-control';

function createFakeScene() {
    return {
        addObject: vi.fn(),
        addObjects: vi.fn(),
        getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
        onTransformChange$: { subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })) },
    } as any;
}

function createFakeThemeService() {
    return {
        getColorFromTheme: vi.fn((key: string) => (key === 'white' ? '#ffffff' : '#3b82f6')),
    } as unknown as ThemeService;
}

describe('SelectionControl', () => {
    it('updates range and shows/hides autofill based on primary', () => {
        const scene = createFakeScene();
        const themeService = createFakeThemeService();

        const control = new SelectionControl(scene, 1, themeService, {
            rowHeaderWidth: 46,
            columnHeaderHeight: 20,
        });

        // No primary: should hide autofill.
        control.updateRange(
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
            },
            null
        );
        expect(control.fillControl.visible).toBe(false);

        // With primary: should show autofill.
        control.updateRange(
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
            },
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
            } as any
        );
        expect(control.fillControl.visible).toBe(true);

        // Avoid disposing here: engine-render shapes expect a real Scene tree.
    });
});
