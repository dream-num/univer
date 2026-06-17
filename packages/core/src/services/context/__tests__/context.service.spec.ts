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

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { ContextService, IContextService } from '../context.service';

const TEXT_CONTEXT_KEY = 'TEST_CONTEXT_KEY';

describe('Test ContextService', () => {
    let contextService: IContextService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IContextService, { useClass: ContextService }]);
        contextService = injector.get(IContextService);
    });

    afterEach(() => {
        (contextService as ContextService).dispose();
    });

    it('notifies subscribers only while they are watching a context key', () => {
        let firstSubscriptionValue: boolean | undefined;
        const firstSubscription = contextService.subscribeContextValue$(TEXT_CONTEXT_KEY).subscribe((value) => {
            firstSubscriptionValue = value;
        });
        expect(firstSubscriptionValue).toBeUndefined();
        contextService.setContextValue(TEXT_CONTEXT_KEY, false);
        expect(firstSubscriptionValue).toBeFalsy();

        firstSubscription.unsubscribe();
        contextService.setContextValue(TEXT_CONTEXT_KEY, true);
        expect(firstSubscriptionValue).toBeFalsy();

        let secondSubscriptionValue: boolean | undefined;
        const secondSubscription = contextService.subscribeContextValue$(TEXT_CONTEXT_KEY).subscribe((value) => {
            secondSubscriptionValue = value;
        });
        expect(secondSubscriptionValue).toBeTruthy();

        contextService.setContextValue(TEXT_CONTEXT_KEY, false);
        expect(secondSubscriptionValue).toBeFalsy();
        secondSubscription.unsubscribe();
    });
});
