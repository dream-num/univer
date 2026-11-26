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
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SetScrollOperation } from '../../operations/scroll.operation';
import { ScrollCommand, SetScrollRelativeCommand } from '../set-scroll.command';

it('preserves the focused pane position for relative and partial scroll commands', async () => {
    const bed = createChartRenderTestBed([[SheetScrollManagerService]]);
    const renders = bed.injector.get(IRenderManagerService);
    const companion = renders.createRender(bed.workbook.getUnitId(), undefined, 'scroll-companion');
    const primaryScroll = bed.render.with(SheetScrollManagerService);
    const companionScroll = companion.with(SheetScrollManagerService);
    const location = { unitId: bed.workbook.getUnitId(), sheetId: 'grid' };
    for (const service of [primaryScroll, companionScroll]) {
        service.setSearchParam(location);
    }
    primaryScroll.setValidScrollState({ ...location, offsetX: 2, offsetY: 3, sheetViewStartRow: 1, sheetViewStartColumn: 2 });
    companionScroll.setValidScrollState({ ...location, offsetX: 15, offsetY: 19, sheetViewStartRow: 5, sheetViewStartColumn: 6 });
    renders.focusRender?.('scroll-companion');
    for (const command of [SetScrollOperation, ScrollCommand, SetScrollRelativeCommand]) {
        bed.commands.registerCommand(command);
    }
    let primaryPosition: unknown;
    let companionPosition: unknown;
    const primarySubscription = primaryScroll.rawScrollInfo$.subscribe((value) => {
        primaryPosition = value;
    });
    const companionSubscription = companionScroll.rawScrollInfo$.subscribe((value) => {
        companionPosition = value;
    });
    try {
        expect(await bed.commands.executeCommand(SetScrollRelativeCommand.id, { offsetX: 5, offsetY: 7 })).toBe(true);
        expect(companionPosition).toMatchObject({ offsetX: 20, offsetY: 26, sheetViewStartRow: 5, sheetViewStartColumn: 6 });
        expect(bed.commands.syncExecuteCommand(ScrollCommand.id, { sheetViewStartRow: 8 })).toBe(true);
        expect(companionPosition).toMatchObject({ offsetX: 15, offsetY: 19, sheetViewStartRow: 8, sheetViewStartColumn: 6 });
        expect(primaryPosition).toBeNull();
    } finally {
        primarySubscription.unsubscribe();
        companionSubscription.unsubscribe();
    }
});
