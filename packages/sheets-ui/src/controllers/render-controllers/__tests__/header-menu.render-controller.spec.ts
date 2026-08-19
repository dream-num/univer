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

import { ThemeService } from '@univerjs/core';
import { IContextMenuService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { HeaderMenuRenderController } from '../header-menu.render-controller';
import { createRenderTestBed, createTestEvent } from './render-test-bed';

describe('HeaderMenuRenderController', () => {
    it('renders a translucent hover state in the base column header area when outline uses margins', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IContextMenuService, { useValue: { triggerContextMenu: vi.fn() } }],
            ],
        });
        const { context, injector, skeleton } = testBed;
        const themeService = injector.get(ThemeService);
        const theme = themeService.getCurrentTheme();

        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                900: '#123456',
            },
        });

        skeleton.columnHeaderHeight = 20;
        skeleton.columnHeaderHeightAndMarginTop = 60;
        (skeleton.worksheet as any).getConfig = () => ({
            columnHeader: { height: 20 },
        });

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as any;
        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN) as any;
        rowHeader.onPointerEnter$ = createTestEvent<any>();
        columnHeader.onPointerEnter$ = createTestEvent<any>();

        const controller = injector.createInstance(HeaderMenuRenderController, context as any);
        columnHeader.onPointerMove$.emit({ offsetX: 99, offsetY: 52, button: 0 }, {});

        const hoverRect = (controller as any)._hoverRect;
        const hoverMenu = (controller as any)._hoverMenu;
        expect(hoverRect.fill).toBe('rgba(18,52,86,0.1)');
        expect(hoverRect.top).toBe(40);
        expect(hoverRect.height).toBe(20);
        expect(hoverMenu.top).toBeCloseTo(40 + 20 / 2 - (20 * 0.8) / 2);

        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                900: '#345678',
            },
        });

        expect(hoverRect.fill).toBe('rgba(52,86,120,0.1)');

        testBed.univer.dispose();
    });
});
