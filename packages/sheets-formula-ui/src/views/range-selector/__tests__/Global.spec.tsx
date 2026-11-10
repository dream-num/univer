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

import type { IUnitRangeName, IWorkbookData, Workbook } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SelectionMoveType, SetWorksheetActiveOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { RediProvider, UniverUIPlugin } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { UniverSheetsFormulaUIPlugin } from '../../../plugin';
import { GlobalRangeSelectorService } from '../../../services/range-selector.service';
import { GlobalRangeSelector } from '../Global';
import { MobileGlobalRangeSelector } from '../MobileGlobal';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let univer: Univer | undefined;
let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(async () => {
    await act(async () => {
        root?.unmount();
        univer?.dispose();
    });
    container?.remove();
    root = undefined;
    univer = undefined;
    container = undefined;
    vi.restoreAllMocks();
});

function createRuntime() {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        return new Proxy({ canvas: this, measureText: (text: string) => ({ width: text.length * 7, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 3 }), getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }) }, { get: (target, key) => Reflect.get(target, key) ?? (() => {}) }) as unknown as CanvasRenderingContext2D;
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    univer.registerPlugin(UniverUIPlugin, { container: document.createElement('div') });
    univer.registerPlugin(UniverSheetsFormulaUIPlugin);
    const injector = univer.__getInjector();
    injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'selector',
        sheetOrder: ['first', 'second'],
        sheets: {
            first: { id: 'first', name: 'First', rowCount: 20, columnCount: 20 },
            second: { id: 'second', name: 'Second', rowCount: 20, columnCount: 20 },
        },
    }, { skipAutoRender: true });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.get(LocaleService).setDirection('ltr');
    root = createRoot(container);
    return { injector, selectors: injector.get(GlobalRangeSelectorService) };
}

describe.each([
    { name: 'desktop', Global: GlobalRangeSelector },
    { name: 'mobile', Global: MobileGlobalRangeSelector },
])('$name range selector composition', ({ Global }) => {
    it('confirms a selection from another worksheet through the global host', async () => {
        const { injector, selectors } = createRuntime();
        await act(async () => root!.render(<RediProvider value={{ injector }}><Global /></RediProvider>));
        let result!: Promise<IUnitRangeName[]>;
        await act(async () => {
            result = selectors.showRangeSelectorDialog({ unitId: 'selector', subUnitId: 'first', supportAcrossSheet: true, maxRangeCount: 1, callback: () => {} });
        });
        await act(async () => {
            injector.get(ICommandService).syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'selector', subUnitId: 'second' });
            injector.get(SheetsSelectionsService).setSelections('selector', 'second', [{ range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 1 }, primary: null, style: null }], SelectionMoveType.MOVE_END);
        });
        const confirm = [...document.querySelectorAll('button')].find((item) => item.textContent === 'Confirm');
        expect(confirm).toBeDefined();
        await act(async () => confirm!.click());
        await expect(result).resolves.toEqual([expect.objectContaining({ sheetName: 'Second', range: expect.objectContaining({ startRow: 1, endRow: 3, startColumn: 0, endColumn: 1 }) })]);
    });
});
