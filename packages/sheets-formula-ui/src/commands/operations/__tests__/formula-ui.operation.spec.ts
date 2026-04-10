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

import type { IAccessor } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { IFormulaPromptService } from '../../../services/prompt.service';
import { MORE_FUNCTIONS_COMPONENT } from '../../../views/more-functions/interface';
import { HelpFunctionOperation } from '../help-function.operation';
import { MoreFunctionsOperation } from '../more-functions.operation';
import { SearchFunctionOperation } from '../search-function.operation';

function createAccessor() {
    const promptService = { help: vi.fn(), search: vi.fn() };
    const sidebarService = { open: vi.fn() };
    const accessor = {
        get(token: unknown) {
            if (token === IFormulaPromptService) {
                return promptService;
            }

            if (token === ISidebarService) {
                return sidebarService;
            }

            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return { accessor, promptService, sidebarService };
}

describe('formula UI operations', () => {
    it('delegates help and search actions to the prompt service', async () => {
        const { accessor, promptService } = createAccessor();

        await expect(HelpFunctionOperation.handler(accessor, { functionName: 'SUM' } as never)).resolves.toBe(true);
        await expect(SearchFunctionOperation.handler(accessor, { searchText: 'count' } as never)).resolves.toBe(true);

        expect(promptService.help).toHaveBeenCalledWith({ functionName: 'SUM' });
        expect(promptService.search).toHaveBeenCalledWith({ searchText: 'count' });
    });

    it('opens the more-functions sidebar with the expected component', async () => {
        const { accessor, sidebarService } = createAccessor();

        await expect(MoreFunctionsOperation.handler(accessor)).resolves.toBe(true);
        expect(sidebarService.open).toHaveBeenCalledWith({
            header: { title: 'formula.insert.tooltip' },
            children: { label: MORE_FUNCTIONS_COMPONENT },
        });
    });
});
