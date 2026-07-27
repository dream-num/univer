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

import { FOCUSING_DOC, IContextService } from '@univerjs/core';
import { createCommandTestBed } from '@univerjs/docs-ui/commands/commands/__tests__/create-command-test-bed';
import { OpenFindDialogOperation } from '@univerjs/find-replace';
import { RibbonStartGroup } from '@univerjs/ui';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { DocsFindReplaceMenuItemFactory } from '../find-replace.menu';
import { menuSchema } from '../schema';

describe('Docs find-replace menu', () => {
    it('places the shared find operation in the Start ribbon and follows Docs focus', async () => {
        const testBed = createCommandTestBed();
        const group = (menuSchema as Record<string, Record<string, unknown>>)[RibbonStartGroup.OTHERS];
        const entry = group?.[OpenFindDialogOperation.id];
        expect(entry).toMatchObject({ order: 3, menuItemFactory: DocsFindReplaceMenuItemFactory });

        const contextService = testBed.get(IContextService);
        contextService.setContextValue(FOCUSING_DOC, true);
        const item = DocsFindReplaceMenuItemFactory(testBed.injector);
        await expect(firstValueFrom(item.disabled$!)).resolves.toBe(false);
        contextService.setContextValue(FOCUSING_DOC, false);
        await expect(firstValueFrom(item.disabled$!)).resolves.toBe(true);
        testBed.univer.dispose();
    });
});
