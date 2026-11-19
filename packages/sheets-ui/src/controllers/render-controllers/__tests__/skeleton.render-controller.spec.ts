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

import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SheetSkeletonRenderController } from '../skeleton.render-controller';
import { createChartRenderTestBed } from './chart-render-test-bed';

describe('SheetSkeletonRenderController', () => {
    it('updates real Grid bounds for leading gaps without replacing Chart page extent from stale Grid data', () => {
        const { render, manager, activate } = createChartRenderTestBed([[SheetSkeletonRenderController]], false, {
            defaultRowHeight: 20,
            defaultColumnWidth: 100,
            rowHeader: { width: 46, hidden: BooleanNumber.FALSE },
            columnHeader: { height: 20, hidden: BooleanNumber.FALSE },
        });
        expect([render.scene.width, render.scene.height]).toEqual([2046, 1020]);
        const skeleton = manager.getCurrentSkeleton()!;
        skeleton.setGapConfig({ rowGaps: { 0: { size: 40 } }, colGaps: { 0: { size: 40 } } });
        manager.setCurrent({ sheetId: 'grid' });
        expect([render.scene.width, render.scene.height]).toEqual([2086, 1060]);
        activate('chart');
        render.scene.transformByState({ width: 1200, height: 900 });
        manager.setCurrent({ sheetId: 'grid' });
        expect([render.scene.width, render.scene.height]).toEqual([1200, 900]);
        activate('grid');
        expect([render.scene.width, render.scene.height]).toEqual([2086, 1060]);
    });
});
