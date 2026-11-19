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

import type { IRenderContext } from '@univerjs/engine-render';
import { IConfigService, Injector, IPermissionService, ThemeService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RangeProtectionRuleModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import type { RangeProtectionRenderExtension } from '../../../views/permission/extensions/range-protection.render';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import {
    SheetPermissionRenderController,
    WorksheetProtectionRenderController,
} from '../sheet-permission-render.controller';

describe('permission render controllers', () => {
    it('registers range protection render extensions and marks skeleton dirty on permission changes', () => {
        const permissionPointUpdate$ = new Subject<unknown>();
        const rangeRuleInitStateChange$ = new Subject<unknown>();
        const ruleChange$ = new Subject<unknown>();
        const spreadsheet = {
            getExtensionByKey: vi.fn(() => null),
            register: vi.fn(),
            makeDirty: vi.fn(),
        };
        const skeletonManagerService = { reCalculate: vi.fn() };

        const injector = new Injector([
            [ThemeService],
            [RangeProtectionRuleModel, { useValue: { rangeRuleInitStateChange$, ruleChange$ } }],
            [SheetSkeletonManagerService, { useValue: skeletonManagerService }],
            [IPermissionService, { useValue: { permissionPointUpdate$ } }],
            [IConfigService, { useValue: { getConfig: () => ({ protectedRangeShadow: 'always' }) } }],
        ]);
        const controller = injector.createInstance(SheetPermissionRenderController, { mainComponent: spreadsheet } as unknown as IRenderContext);

        expect(spreadsheet.register).toHaveBeenCalledTimes(2);

        rangeRuleInitStateChange$.next({});
        expect(skeletonManagerService.reCalculate).toHaveBeenCalled();
        expect(spreadsheet.makeDirty).toHaveBeenCalled();

        spreadsheet.makeDirty.mockClear();
        injector.get(ThemeService).setDarkMode(true);
        expect(spreadsheet.makeDirty).toHaveBeenCalled();

        controller.dispose();
        spreadsheet.makeDirty.mockClear();
        injector.get(ThemeService).setDarkMode(false);
        expect(spreadsheet.makeDirty).not.toHaveBeenCalled();
        injector.dispose();
    });

    it('skips duplicate range protection extensions and clears render caches when rules change', () => {
        const ruleChange$ = new Subject<unknown>();
        const spreadsheet = {
            getExtensionByKey: vi.fn<() => RangeProtectionRenderExtension | null>(() => null),
            register: vi.fn<(extension: RangeProtectionRenderExtension) => void>(),
            makeDirty: vi.fn(),
        };
        const injector = new Injector([
            [ThemeService],
            [RangeProtectionRuleModel, { useValue: { rangeRuleInitStateChange$: new Subject(), ruleChange$ } }],
            [SheetSkeletonManagerService, { useValue: { reCalculate: vi.fn() } }],
            [IPermissionService, { useValue: { permissionPointUpdate$: new Subject() } }],
            [IConfigService, { useValue: { getConfig: () => ({ protectedRangeShadow: 'always' }) } }],
        ]);
        const controller = injector.createInstance(SheetPermissionRenderController, { mainComponent: spreadsheet } as unknown as IRenderContext);

        const [[canView], [canNotView]] = spreadsheet.register.mock.calls;
        vi.spyOn(canView, 'clearCache');
        vi.spyOn(canNotView, 'clearCache');
        canView.renderCache.add('old-rule');
        canNotView.renderCache.add('new-rule');
        ruleChange$.next({ oldRule: { id: 'old-rule' }, rule: { id: 'new-rule' } });

        expect(canView.clearCache).toHaveBeenCalled();
        expect(canNotView.clearCache).toHaveBeenCalled();

        spreadsheet.getExtensionByKey.mockReturnValue(canView);
        const duplicateController = injector.createInstance(SheetPermissionRenderController, { mainComponent: spreadsheet } as unknown as IRenderContext);
        expect(spreadsheet.register).toHaveBeenCalledTimes(2);

        duplicateController.dispose();
        controller.dispose();
        injector.dispose();
    });

    it('registers worksheet protection extension unless shadow rendering is disabled', () => {
        const worksheetRuleInitStateChange$ = new Subject<unknown>();
        const spreadsheet = {
            getExtensionByKey: vi.fn(() => null),
            register: vi.fn(),
            makeDirty: vi.fn(),
        };
        const skeletonManagerService = { reCalculate: vi.fn() };
        const renderManagerService = { getRenderUnitById: vi.fn(() => ({ mainComponent: spreadsheet })) };
        const injector = new Injector([
            [ThemeService],
            [IRenderManagerService, { useValue: renderManagerService }],
            [SheetSkeletonManagerService, { useValue: skeletonManagerService }],
            [WorksheetProtectionRuleModel, { useValue: { worksheetRuleInitStateChange$ } }],
            [IConfigService, { useValue: { getConfig: () => ({ protectedRangeShadow: 'always' }) } }],
        ]);
        const controller = injector.createInstance(WorksheetProtectionRenderController, { unitId: 'unit-1', mainComponent: spreadsheet } as unknown as IRenderContext);

        expect(spreadsheet.register).toHaveBeenCalledTimes(1);
        worksheetRuleInitStateChange$.next({});
        expect(skeletonManagerService.reCalculate).toHaveBeenCalled();
        expect(spreadsheet.makeDirty).toHaveBeenCalled();
        spreadsheet.makeDirty.mockClear();
        injector.get(ThemeService).setDarkMode(true);
        expect(spreadsheet.makeDirty).toHaveBeenCalled();
        controller.dispose();
        spreadsheet.makeDirty.mockClear();
        injector.get(ThemeService).setDarkMode(false);
        expect(spreadsheet.makeDirty).not.toHaveBeenCalled();
        injector.dispose();

        const disabledSpreadsheet = { getExtensionByKey: vi.fn(), register: vi.fn() };
        const disabledInjector = new Injector([
            [ThemeService],
            [IRenderManagerService, { useValue: { getRenderUnitById: () => ({ mainComponent: disabledSpreadsheet }) } }],
            [SheetSkeletonManagerService, { useValue: { reCalculate: vi.fn() } }],
            [WorksheetProtectionRuleModel, { useValue: { worksheetRuleInitStateChange$: new Subject() } }],
            [IConfigService, { useValue: { getConfig: () => ({ protectedRangeShadow: 'none' }) } }],
        ]);
        const disabledController = disabledInjector.createInstance(WorksheetProtectionRenderController, { unitId: 'unit-1', mainComponent: disabledSpreadsheet } as unknown as IRenderContext);

        expect(disabledSpreadsheet.register).not.toHaveBeenCalled();
        disabledController.dispose();
        disabledInjector.dispose();
    });
});
