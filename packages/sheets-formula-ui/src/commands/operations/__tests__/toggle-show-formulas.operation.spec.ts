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
import { ICommandService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsShowFormulasService } from '../../../services/show-formulas.service';
import { ToggleShowFormulasOperation } from '../toggle-show-formulas.operation';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test toggle show formulas operation', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let showFormulasService: SheetsShowFormulasService;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [[SheetsShowFormulasService]]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ToggleShowFormulasOperation);
        showFormulasService = get(SheetsShowFormulasService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('toggles the active worksheet when no target is given', async () => {
        expect(showFormulasService.isEnabled('test', 'sheet1')).toBe(false);

        expect(await commandService.executeCommand(ToggleShowFormulasOperation.id)).toBe(true);
        expect(showFormulasService.isEnabled('test', 'sheet1')).toBe(true);

        expect(await commandService.executeCommand(ToggleShowFormulasOperation.id)).toBe(true);
        expect(showFormulasService.isEnabled('test', 'sheet1')).toBe(false);
    });

    it('applies an explicit state to the given worksheet', async () => {
        expect(await commandService.executeCommand(ToggleShowFormulasOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            enabled: true,
        })).toBe(true);
        expect(showFormulasService.isEnabled('test', 'sheet1')).toBe(true);

        // Requesting the current state is a no-op.
        expect(await commandService.executeCommand(ToggleShowFormulasOperation.id, { enabled: true })).toBe(false);
        expect(showFormulasService.isEnabled('test', 'sheet1')).toBe(true);
    });

    it('fails for unknown worksheets', async () => {
        expect(await commandService.executeCommand(ToggleShowFormulasOperation.id, {
            unitId: 'test',
            subUnitId: 'missing',
        })).toBe(false);
        expect(showFormulasService.isEnabled('test', 'missing')).toBe(false);
    });
});
