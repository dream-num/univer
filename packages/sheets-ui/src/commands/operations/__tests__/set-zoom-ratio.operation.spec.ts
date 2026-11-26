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

import { IRenderManagerService } from '@univerjs/engine-render';
import { expect, it } from 'vitest';
import { createChartRenderTestBed } from '../../../controllers/render-controllers/__tests__/chart-render-test-bed';
import { SheetsZoomRenderController } from '../../../controllers/render-controllers/zoom.render-controller';
import { SetZoomRatioOperation } from '../set-zoom-ratio.operation';

it('keeps both workbook panes at the shared worksheet zoom ratio', () => {
    const bed = createChartRenderTestBed([[SheetsZoomRenderController]]);
    const renders = bed.injector.get(IRenderManagerService);
    const companion = renders.createRender(bed.workbook.getUnitId(), undefined, 'zoom-companion');
    bed.commands.registerCommand(SetZoomRatioOperation);
    expect(bed.commands.syncExecuteCommand(SetZoomRatioOperation.id, {
        unitId: bed.workbook.getUnitId(),
        subUnitId: 'grid',
        zoomRatio: 1.5,
    })).toBe(true);
    expect(bed.workbook.getActiveSheet()!.getZoomRatio()).toBe(1.5);
    expect([bed.render.scene.scaleX, companion.scene.scaleX]).toEqual([1.5, 1.5]);
});
