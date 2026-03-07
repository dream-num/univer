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

import type { Injector, Univer } from '@univerjs/core';
import { EDITOR_ACTIVATED, FOCUSING_SHEET, IContextService } from '@univerjs/core';
import { RibbonDataGroup } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from '../../__tests__/create-test-bed';
import { OpenFindDialogOperation } from '../../commands/operations/find-replace.operation';
import { FindReplaceMenuItemFactory } from '../find-replace.menu';
import { menuSchema } from '../menu.schema';

describe('find-replace.menu', () => {
    let univer: Univer;
    let get: Injector['get'];

    beforeEach(() => {
        const testBed = createTestBed();
        univer = testBed.univer;
        get = testBed.get;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should build menu item and compute disabled state from context values', () => {
        const contextService = get(IContextService);
        contextService.setContextValue(EDITOR_ACTIVATED, false);
        contextService.setContextValue(FOCUSING_SHEET, true);

        const menuItem = FindReplaceMenuItemFactory({ get } as never);
        const states: boolean[] = [];
        const sub = menuItem.disabled$!.subscribe((value) => states.push(value));

        contextService.setContextValue(EDITOR_ACTIVATED, true);
        contextService.setContextValue(FOCUSING_SHEET, false);
        sub.unsubscribe();

        expect(menuItem.id).toBe(OpenFindDialogOperation.id);
        expect(menuItem.tooltip).toBe('find-replace.toolbar');
        expect(states[0]).toBe(false);
        expect(states).toContain(true);
    });

    it('should expose toolbar schema entry for open-find operation', () => {
        const schema = menuSchema as Record<string, Record<string, unknown>>;
        expect(schema[RibbonDataGroup.ORGANIZATION][OpenFindDialogOperation.id]).toEqual(
            expect.objectContaining({
                order: 2,
                menuItemFactory: FindReplaceMenuItemFactory,
            })
        );
    });
});
