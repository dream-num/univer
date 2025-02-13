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

import { ICommandService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Injector, Univer } from '@univerjs/core';

import { SetInlineFormatBoldCommand } from '../inline-format.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('example', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetInlineFormatBoldCommand);
    });

    afterEach(() => univer.dispose());

    describe('XXX', () => {
        it('Should XXX', async () => {
            expect(true).toBe(true);
        });
    });
});
