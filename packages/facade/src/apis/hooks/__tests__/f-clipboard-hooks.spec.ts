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

import { type Injector, IUndoRedoService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { FUniver } from '../../facade';
import type { FWorksheet } from '../../sheets/f-worksheet';
import type { FWorkbook } from '../../sheets/f-workbook';

function createUnitTestBed(): {
    univer: Univer;
    get: Injector['get'];
    univerAPI: FUniver;
    injector: Injector;
} {
    const univer = new Univer({
        theme: {},
        locales: {},
    });
    const injector = univer.__getInjector();
    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverDocsUIPlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverUIPlugin, {
        container: document.createElement('div'),
        footer: false,
        header: false,
    });
    univer.registerPlugin(UniverSheetsUIPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);

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
        const text = 'Hello World';
        expect(sheet).not.toBeUndefined();
        const a1 = sheet.getRange(0, 0);
        await a1.setValue(text);
        const b1 = sheet.getRange(1, 0);
        workbook.setActiveSelection(a1);
        await univerAPI.copy();
        workbook.setActiveSelection(b1);
        await univerAPI.paste();
        expect(b1.getValue()).toBe(text);
    });
});

