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

import type { FWorksheet } from '@univerjs/sheets/facade';
import { type Injector, IUndoRedoService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
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

describe('Test Undo Redo Hooks', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createUnitTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
    });

    it('undoredo normal case', async () => {
        const sheet = univerAPI.getActiveWorkbook()?.getActiveSheet() as FWorksheet;
        expect(sheet).not.toBeUndefined();
        const range = sheet.getRange(0, 0);
        const emptyFlag = '';
        const text = 'Hello World';
        await range.setValue(emptyFlag);
        await range.setValue(text);
        univerAPI.getHooks().onBeforeUndo(() => {
            expect(range.getValue()).toBe(text);
        });
        univerAPI.getHooks().onUndo(() => {
            expect(range.getValue()).toBe(emptyFlag);
        });
        univerAPI.getHooks().onBeforeRedo(() => {
            expect(range.getValue()).toBe(emptyFlag);
        });
        univerAPI.getHooks().onRedo(() => {
            expect(range.getValue()).toBe(text);
        });
        expect(range.getValue()).toBe(text);
        await univerAPI.undo();
        expect(range.getValue()).toBe(emptyFlag);
        await univerAPI.redo();
        expect(range.getValue()).toBe(text);
    });

    it('undoredo edge case', async () => {
        const sheet = univerAPI.getActiveWorkbook()?.getActiveSheet() as FWorksheet;
        expect(sheet).not.toBeUndefined();

        // manually construct undo redo service
        get(IUndoRedoService);

        const beforeUndoFn = vi.fn();
        const afterUndoFn = vi.fn();
        const beforeRedoFn = vi.fn();
        const afterRedoFn = vi.fn();

        univerAPI.getHooks().onBeforeUndo(beforeUndoFn);
        univerAPI.getHooks().onUndo(afterUndoFn);
        univerAPI.getHooks().onBeforeRedo(beforeRedoFn);
        univerAPI.getHooks().onRedo(afterRedoFn);

        await univerAPI.undo();
        await univerAPI.redo();

        expect(beforeUndoFn).toHaveBeenCalledTimes(0);
        expect(afterUndoFn).toHaveBeenCalledTimes(0);
        expect(beforeRedoFn).toHaveBeenCalledTimes(0);
        expect(afterRedoFn).toHaveBeenCalledTimes(0);
    });
});

