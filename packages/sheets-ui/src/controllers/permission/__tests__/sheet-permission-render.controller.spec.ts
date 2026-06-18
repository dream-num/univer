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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
    SheetPermissionRenderController,
    WorksheetProtectionRenderController,
} from '../sheet-permission-render.controller';

describe('permission render controllers', () => {
    it('registers range protection render extensions and marks skeleton dirty on permission changes', () => {
        const permissionPointUpdate$ = new Subject<any>();
        const rangeRuleInitStateChange$ = new Subject<any>();
        const ruleChange$ = new Subject<any>();
        const spreadsheet = {
            getExtensionByKey: vi.fn(() => null),
            register: vi.fn(),
            makeDirty: vi.fn(),
        };
        const skeletonManagerService = { reCalculate: vi.fn() };

        const controller = new SheetPermissionRenderController(
            { mainComponent: spreadsheet } as any,
            { rangeRuleInitStateChange$, ruleChange$ } as any,
            skeletonManagerService as any,
            { permissionPointUpdate$ } as any,
            { getConfig: vi.fn(() => ({ protectedRangeShadow: 'always' })) } as any
        );

        expect(spreadsheet.register).toHaveBeenCalledTimes(2);

        rangeRuleInitStateChange$.next({});
        expect(skeletonManagerService.reCalculate).toHaveBeenCalled();
        expect(spreadsheet.makeDirty).toHaveBeenCalled();

        controller.dispose();
    });

    it('skips duplicate range protection extensions and clears render caches when rules change', () => {
        const ruleChange$ = new Subject<any>();
        const spreadsheet = {
            getExtensionByKey: vi.fn(() => ({ alreadyRegistered: true })),
            register: vi.fn(),
            makeDirty: vi.fn(),
        };
        const controller = new SheetPermissionRenderController(
            { mainComponent: spreadsheet } as any,
            { rangeRuleInitStateChange$: new Subject(), ruleChange$ } as any,
            { reCalculate: vi.fn() } as any,
            { permissionPointUpdate$: new Subject() } as any,
            { getConfig: vi.fn(() => ({ protectedRangeShadow: 'always' })) } as any
        );

        const canView = (controller as any)._rangeProtectionCanViewRenderExtension;
        const canNotView = (controller as any)._rangeProtectionCanNotViewRenderExtension;
        vi.spyOn(canView, 'clearCache');
        vi.spyOn(canNotView, 'clearCache');
        canView.renderCache.add('old-rule');
        canNotView.renderCache.add('new-rule');
        ruleChange$.next({ oldRule: { id: 'old-rule' }, rule: { id: 'new-rule' } });

        expect(spreadsheet.register).not.toHaveBeenCalled();
        expect(canView.clearCache).toHaveBeenCalled();
        expect(canNotView.clearCache).toHaveBeenCalled();

        controller.dispose();
    });

    it('registers worksheet protection extension unless shadow rendering is disabled', () => {
        const worksheetRuleInitStateChange$ = new Subject<any>();
        const spreadsheet = {
            getExtensionByKey: vi.fn(() => null),
            register: vi.fn(),
            makeDirty: vi.fn(),
        };
        const skeletonManagerService = { reCalculate: vi.fn() };
        const renderManagerService = { getRenderById: vi.fn(() => ({ mainComponent: spreadsheet })) };
        const controller = new WorksheetProtectionRenderController(
            { unitId: 'unit-1', mainComponent: spreadsheet } as any,
            renderManagerService as any,
            skeletonManagerService as any,
            { worksheetRuleInitStateChange$ } as any,
            { getConfig: vi.fn(() => ({ protectedRangeShadow: 'always' })) } as any
        );

        expect(spreadsheet.register).toHaveBeenCalledTimes(1);
        worksheetRuleInitStateChange$.next({});
        expect(skeletonManagerService.reCalculate).toHaveBeenCalled();
        expect(spreadsheet.makeDirty).toHaveBeenCalled();
        controller.dispose();

        const disabledSpreadsheet = { getExtensionByKey: vi.fn(), register: vi.fn() };
        const disabledController = new WorksheetProtectionRenderController(
            { unitId: 'unit-1', mainComponent: disabledSpreadsheet } as any,
            { getRenderById: vi.fn(() => ({ mainComponent: disabledSpreadsheet })) } as any,
            { reCalculate: vi.fn() } as any,
            { worksheetRuleInitStateChange$: new Subject() } as any,
            { getConfig: vi.fn(() => ({ protectedRangeShadow: 'none' })) } as any
        );

        expect(disabledSpreadsheet.register).not.toHaveBeenCalled();
        disabledController.dispose();
    });
});
