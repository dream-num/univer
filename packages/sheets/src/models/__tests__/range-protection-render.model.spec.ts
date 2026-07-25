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

import type { IDisposable, Injector, Univer } from '@univerjs/core';
import { IPermissionService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../services/__tests__/util';
import { RangeProtectionRenderModel } from '../range-protection-render.model';
import { RangeProtectionRuleModel } from '../range-protection-rule.model';

describe('RangeProtectionRenderModel', () => {
    let univer: Univer;
    let get: Injector['get'];

    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [
            [RangeProtectionRuleModel],
            [RangeProtectionRenderModel],
        ]);

        univer = testBed.univer;
        get = testBed.get;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('releases its cache invalidation subscriptions on disposal', () => {
        const permissionService = get(IPermissionService) as any;
        const ruleModel = get(RangeProtectionRuleModel) as any;
        const permissionObserverCount = permissionService._permissionPointUpdate$.observers.length;
        const ruleObserverCount = ruleModel._ruleChange$.observers.length;
        const renderModel = get(RangeProtectionRenderModel);

        expect(permissionService._permissionPointUpdate$.observers).toHaveLength(permissionObserverCount + 1);
        expect(ruleModel._ruleChange$.observers).toHaveLength(ruleObserverCount + 1);

        (renderModel as unknown as IDisposable).dispose();

        expect(permissionService._permissionPointUpdate$.observers).toHaveLength(permissionObserverCount);
        expect(ruleModel._ruleChange$.observers).toHaveLength(ruleObserverCount);
    });
});
