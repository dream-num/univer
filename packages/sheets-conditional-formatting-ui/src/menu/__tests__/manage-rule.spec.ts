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

import type { IDisposable } from '@univerjs/core';
import { ICommandService, toDisposable } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { FactoryManageConditionalFormattingRule } from '../manage-rule';

describe('FactoryManageConditionalFormattingRule', () => {
    let univer: IDisposable | undefined;

    afterEach(() => {
        univer?.dispose();
        vi.restoreAllMocks();
    });

    it('disposes command listeners with the selections subscription', () => {
        const testBed = createCfUiTestBed();
        univer = testBed.univer;
        const commandService = testBed.get(ICommandService);
        const onCommandExecuted = commandService.onCommandExecuted.bind(commandService);
        let activeListeners = 0;

        vi.spyOn(commandService, 'onCommandExecuted').mockImplementation((listener) => {
            activeListeners++;
            const disposable = onCommandExecuted(listener);
            return toDisposable(() => {
                activeListeners--;
                disposable.dispose();
            });
        });

        const menu = FactoryManageConditionalFormattingRule(testBed.injector);
        if (!menu.selections || Array.isArray(menu.selections)) {
            throw new Error('Expected observable selections');
        }
        const subscription = menu.selections.subscribe();
        expect(activeListeners).toBe(2);

        subscription.unsubscribe();
        expect(activeListeners).toBe(0);
    });
});
