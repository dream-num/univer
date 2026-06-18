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

import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { createFakeScene, createFakeSkeleton, createFakeViewport } from '../../../controllers/render-controllers/__tests__/render-test-bed';
import { IMarkSelectionService, MarkSelectionService } from '../mark-selection.service';

class TestSheetSkeletonService {
    readonly skeleton = createFakeSkeleton();

    getSkeleton() {
        return this.skeleton;
    }
}

class TestRenderManagerService {
    readonly scene = createFakeScene(new Map([[SHEET_VIEWPORT_KEY.VIEW_MAIN, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)]]));

    getRenderById() {
        return { scene: this.scene };
    }
}

function createService(workbookData = {
    id: 'unit-1',
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
        },
    },
    sheetOrder: ['sheet-1'],
}): IMarkSelectionService {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([SheetSkeletonService, { useClass: TestSheetSkeletonService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([ThemeService]);
    injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, workbookData);
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit(workbookData.id);
    return injector.get(IMarkSelectionService);
}

describe('MarkSelectionService', () => {
    it('stores temporary marked selections and removes them when the source action ends', () => {
        const service = createService();
        const selection = {
            range: { startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 },
            primary: null,
        };

        const id = service.addShapeWithNoFresh(selection as never, ['sheet.mutation.set-values']);
        expect(id).toBeTruthy();
        expect(service.getShapeMap().get(id!)).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            selection,
            exits: ['sheet.mutation.set-values'],
        });

        service.removeShape(id!);
        expect(service.getShapeMap().size).toBe(0);
    });

    it('refreshes marked selections for the active sheet and clears rendered controls', () => {
        const service = createService();
        const selection = {
            range: { startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 },
            primary: null,
        };

        const firstId = service.addShape(selection as never);
        const secondId = service.addShapeWithNoFresh({
            range: { startRow: 4, endRow: 4, startColumn: 1, endColumn: 1 },
            primary: null,
        } as never);

        expect(service.getShapeMap().get(firstId!)?.control?.getRange()).toMatchObject({
            startRow: 1,
            endRow: 2,
            startColumn: 3,
            endColumn: 4,
        });
        expect(service.getShapeMap().get(secondId!)?.control).toBeNull();

        service.refreshShapes();
        expect(service.getShapeMap().get(secondId!)?.control?.getRange()).toMatchObject({
            startRow: 4,
            endRow: 4,
            startColumn: 1,
            endColumn: 1,
        });

        service.removeShape('missing');
        expect(service.getShapeMap().size).toBe(2);

        service.removeAllShapes();
        expect(service.getShapeMap().size).toBe(0);
    });
});
