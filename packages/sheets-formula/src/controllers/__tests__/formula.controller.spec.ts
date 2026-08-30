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
import { describe, expect, it } from 'vitest';
import { InsertFunctionCommand } from '../../commands/commands/insert-function.command';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { FormulaController } from '../formula.controller';

describe('FormulaController', () => {
    it('registers InsertFunctionCommand through the real command service', () => {
        const testBed = createFacadeTestBed(undefined, [[FormulaController]]);
        const commandService = testBed.injector.get(ICommandService);

        expect(commandService.hasCommand(InsertFunctionCommand.id)).toBe(false);

        testBed.injector.get(FormulaController);

        expect(commandService.hasCommand(InsertFunctionCommand.id)).toBe(true);

        testBed.univer.dispose();
    });
});
