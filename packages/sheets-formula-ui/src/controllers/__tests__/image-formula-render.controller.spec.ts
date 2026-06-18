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

import { UniverInstanceType } from '@univerjs/core';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { ImageFormulaRenderController } from '../image-formula-render.controller';

describe('ImageFormulaRenderController', () => {
    it('refreshes sheet skeleton and marks the main component dirty for image formula changes', () => {
        let refresh: () => void = () => undefined;
        const skeletonManagerService = { reCalculate: vi.fn() };
        const mainComponent = { makeDirty: vi.fn() };
        const render = {
            with: vi.fn((token) => token === SheetSkeletonManagerService ? skeletonManagerService : null),
            mainComponent,
        };
        const workbook = { getUnitId: vi.fn(() => 'unit-1') };

        new ImageFormulaRenderController(
            { registerRefreshRenderFunction: vi.fn((fn) => { refresh = fn; }) } as any,
            { getRenderById: vi.fn(() => render) } as any,
            { getCurrentUnitOfType: vi.fn((type) => type === UniverInstanceType.UNIVER_SHEET ? workbook : null) } as any
        );

        refresh();

        expect(render.with).toHaveBeenCalledWith(SheetSkeletonManagerService);
        expect(skeletonManagerService.reCalculate).toHaveBeenCalled();
        expect(mainComponent.makeDirty).toHaveBeenCalled();
    });

    it('does nothing when there is no workbook, render, or main component', () => {
        let refresh: () => void = () => undefined;
        const imageFormulaController = { registerRefreshRenderFunction: vi.fn((fn) => {
            refresh = fn;
        }) };
        const renderManagerService = { getRenderById: vi.fn<(...args: any[]) => any>(() => null) };
        const univerInstanceService = { getCurrentUnitOfType: vi.fn<(...args: any[]) => any>(() => null) };

        new ImageFormulaRenderController(
            imageFormulaController as any,
            renderManagerService as any,
            univerInstanceService as any
        );

        refresh();
        expect(renderManagerService.getRenderById).not.toHaveBeenCalled();

        univerInstanceService.getCurrentUnitOfType.mockReturnValue({ getUnitId: () => 'unit-1' });
        refresh();
        expect(renderManagerService.getRenderById).toHaveBeenCalledWith('unit-1');

        renderManagerService.getRenderById.mockReturnValue({
            with: vi.fn(() => ({ reCalculate: vi.fn() })),
            mainComponent: null,
        });
        expect(() => refresh()).not.toThrow();
    });
});
