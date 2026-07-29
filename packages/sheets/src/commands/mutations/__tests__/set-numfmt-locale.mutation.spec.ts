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
import { afterEach, describe, expect, it } from 'vitest';
import { SetNumfmtLocaleMutation } from '../set-numfmt-locale.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('SetNumfmtLocaleMutation', () => {
    const disposables: Array<ReturnType<typeof createCommandTestBed>['univer']> = [];

    afterEach(() => {
        disposables.splice(0).forEach((univer) => univer.dispose());
    });

    it('stores the last applied number-format locale in the workbook snapshot', () => {
        const testBed = createCommandTestBed();
        disposables.push(testBed.univer);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetNumfmtLocaleMutation);

        expect(commandService.syncExecuteCommand(SetNumfmtLocaleMutation.id, {
            unitId: testBed.sheet.getUnitId(),
            locale: 'de',
        })).toBe(true);
        expect(testBed.sheet.save().numfmtLocale).toBe('de');

        expect(commandService.syncExecuteCommand(SetNumfmtLocaleMutation.id, {
            unitId: testBed.sheet.getUnitId(),
            locale: 'ja',
        })).toBe(true);
        expect(testBed.sheet.save().numfmtLocale).toBe('ja');
    });
});
