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

import { Injector } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { MORE_FUNCTIONS_COMPONENT } from '../../../views/more-functions/interface';
import { MoreFunctionsOperation } from '../more-functions.operation';

describe('MoreFunctionsOperation', () => {
    it('opens the function browser in the sidebar', async () => {
        const injector = new Injector();
        const open = vi.fn();
        injector.add([ISidebarService, { useValue: { open } as unknown as ISidebarService }]);
        await expect(MoreFunctionsOperation.handler(injector)).resolves.toBe(true);
        expect(open).toHaveBeenCalledWith({
            header: { title: 'sheets-formula-ui.insert.tooltip' },
            children: { label: MORE_FUNCTIONS_COMPONENT },
        });
    });
});
