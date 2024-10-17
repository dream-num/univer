/**
 * Copyright 2023-present DreamNum Inc.
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

import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { ICommandService, type Injector, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { CopyCommand, PasteCommand } from '@univerjs/ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FUniver } from '../../everything';

function createUnitTestBed(): {
    univer: Univer;
    get: Injector['get'];
    univerAPI: FUniver;
    injector: Injector;
} {
    const univer = new Univer();
    const injector = univer.__getInjector();
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverRenderEnginePlugin);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(PasteCommand);
    commandService.registerCommand(CopyCommand);

    const sheet = univer.createUnit(UniverInstanceType.UNIVER_SHEET, {});
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit(sheet.getUnitId());
    const univerAPI = FUniver.newAPI(univer);

    return {
        univer,
        get: injector.get.bind(injector),
        univerAPI,
        injector,
    };
}

describe('Test Clipboard Hooks', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createUnitTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
    });

    it('clipboard normal case', async () => {
        const workbook = univerAPI.getActiveWorkbook() as FWorkbook;
        const sheet = workbook.getActiveSheet() as FWorksheet;
        expect(sheet).not.toBeUndefined();

        const beforeCopyFn = vi.fn();
        const afterCopyFn = vi.fn();
        const beforePasteFn = vi.fn();
        const afterPasteFn = vi.fn();

        univerAPI.getHooks().onBeforeCopy(beforeCopyFn);
        univerAPI.getHooks().onCopy(afterCopyFn);
        univerAPI.getHooks().onBeforePaste(beforePasteFn);
        univerAPI.getHooks().onPaste(afterPasteFn);

        await univerAPI.copy();
        await univerAPI.paste();

        expect(beforeCopyFn).toHaveBeenCalledTimes(1);
        expect(afterCopyFn).toHaveBeenCalledTimes(1);
        expect(beforePasteFn).toHaveBeenCalledTimes(1);
        expect(afterPasteFn).toHaveBeenCalledTimes(1);
    });
});

