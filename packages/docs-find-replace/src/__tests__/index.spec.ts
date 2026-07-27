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

import type { IFindReplaceService } from '@univerjs/find-replace';
import type { IMenuManagerService } from '@univerjs/ui';
import { toDisposable } from '@univerjs/core';
import { createCommandTestBed } from '@univerjs/docs-ui/commands/commands/__tests__/create-command-test-bed';
import { IFindReplaceService as FindReplaceServiceToken } from '@univerjs/find-replace';
import { IMenuManagerService as MenuManagerServiceToken } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DocsFindReplaceController } from '../controllers/docs-find-replace.controller';
import { UniverDocsFindReplacePlugin } from '../index';

describe('UniverDocsFindReplacePlugin', () => {
    it('resolves the controller on steady', () => {
        const testBed = createCommandTestBed(undefined, [
            [FindReplaceServiceToken, { useValue: { registerFindReplaceProvider: vi.fn(() => toDisposable(() => undefined)) } as unknown as IFindReplaceService }],
            [MenuManagerServiceToken, { useValue: { mergeMenu: vi.fn() } as unknown as IMenuManagerService }],
        ]);
        const plugin = testBed.injector.createInstance(UniverDocsFindReplacePlugin, undefined);

        plugin.onStarting();
        plugin.onSteady();
        expect(testBed.injector.get(DocsFindReplaceController)).toBeInstanceOf(DocsFindReplaceController);
        testBed.univer.dispose();
    });
});
