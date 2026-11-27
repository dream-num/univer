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
import { FunctionType } from '@univerjs/engine-formula';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { IFormulaPromptService } from '../../../services/prompt.service';
import { HelpFunctionOperation } from '../help-function.operation';
import { createCommandTestBed } from './create-command-test-bed';

describe('HelpFunctionOperation', () => {
    it('opens the requested help in the formula editor', async () => {
        const { get, univer } = createCommandTestBed();
        onTestFinished(() => univer.dispose());
        const commandService = get(ICommandService);
        commandService.registerCommand(HelpFunctionOperation);
        const prompt = get(IFormulaPromptService);
        const params = {
            visible: true,
            paramIndex: 1,
            functionInfo: { functionName: 'SUM', functionType: FunctionType.Math, functionParameter: [], description: '', abstract: '' },
        };
        const next = firstValueFrom(prompt.help$);
        expect(await commandService.executeCommand(HelpFunctionOperation.id, params)).toBe(true);
        expect(await next).toEqual(params);
        expect(prompt.isHelping()).toBe(true);
    });
});
