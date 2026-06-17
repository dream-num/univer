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
    ConfigService,
    ContextService,
    DesktopLogService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceService,
    UniverInstanceType,
    Workbook,
} from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

describe('SheetSkeletonManagerService', () => {
    it('sets the current worksheet skeleton and marks it dirty for recalculation', () => {
        const injector = new Injector();
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([LocaleService]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([SheetSkeletonService]);
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        const workbook = injector.createInstance(Workbook, {
            id: 'unit-1',
            sheets: { 'sheet-1': { id: 'sheet-1' } },
            sheetOrder: ['sheet-1'],
        });
        injector.get(SheetSkeletonService);
        univerInstanceService.__addUnit(workbook);

        const service = injector.createInstance(SheetSkeletonManagerService, {
            unit: workbook,
            unitId: 'unit-1',
            type: UniverInstanceType.UNIVER_SHEET,
            scene: {
                onTransformChange$: {
                    subscribeEvent: () => ({ dispose: () => {} }),
                },
            },
        } as never);

        service.setCurrent({ sheetId: 'sheet-1' });
        service.makeDirty({ sheetId: 'sheet-1' });

        expect(service.getCurrentParam()).toMatchObject({ unitId: 'unit-1', sheetId: 'sheet-1', dirty: true });
        expect(service.ensureSkeleton('sheet-1')).toBe(service.getCurrentSkeleton());
    });
});
