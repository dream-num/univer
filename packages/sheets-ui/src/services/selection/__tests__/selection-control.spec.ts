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
import { beforeAll, describe, expect, it, vi } from 'vitest';
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
    beforeAll(() => {
        vi.stubGlobal('window', {
            cancelAnimationFrame: vi.fn(),
            requestAnimationFrame: vi.fn(() => 1),
        });
    });

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

    it('keeps header highlights aligned with outline header padding', () => {
        const scene = createFakeScene();
        const themeService = createFakeThemeService();
        const control = new SelectionControl(scene, 1, themeService, {
            rowHeaderWidth: 46,
            columnHeaderHeight: 20,
        });

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 3,
                endRow: 5,
                startColumn: 1,
                endColumn: 2,
                startX: 126,
                startY: 108,
                endX: 246,
                endY: 168,
            },
            primaryWithCoord: null,
            style: null,
        }, {
            rowHeaderWidth: 46,
            rowHeaderWidthAndMarginLeft: 86,
            columnHeaderHeight: 20,
            columnHeaderHeightAndMarginTop: 60,
        } as any);

        expect((control as any)._rowHeaderGroup.left).toBe(40);
        expect((control as any)._rowHeaderGroup.top).toBe(108);
        expect((control as any)._columnHeaderGroup.left).toBe(126);
        expect((control as any)._columnHeaderGroup.top).toBe(40);
    });
});
