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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleService,
    LocaleType,
    LogLevel,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { FindReplaceService, IFindReplaceService } from '@univerjs/find-replace';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import {
    ScrollToCellCommand,
    SheetScrollManagerService,
    SheetSkeletonManagerService,
    SheetsScrollRenderController,
} from '@univerjs/sheets-ui';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FTextFinder, IFTextFinder } from '../f-text-finder';
import { SheetsFindReplaceController } from '../../controllers/sheet-find-replace.controller';
import { UniverSheetsFindReplaceMobileUIPlugin } from '../../mobile-plugin';
import { UniverSheetsFindReplacePlugin } from '../../plugin';
import '@univerjs/sheets/facade';
import '../f-univer';

function createRuntime(pluginMode?: 'desktop' | 'mobile') {
    const univer = new Univer();
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverRenderEnginePlugin);
    const injector = univer.__getInjector();
    injector.add([IFindReplaceService, { useClass: FindReplaceService }]);
    if (pluginMode === 'desktop') {
        injector.add([UniverSheetsFindReplacePlugin, {
            useFactory: function createDesktopPlugin(currentInjector: Injector) {
                return currentInjector.createInstance(UniverSheetsFindReplacePlugin, {});
            },
            deps: [Injector],
        }]);
        injector.get(UniverSheetsFindReplacePlugin).onStarting();
    } else if (pluginMode === 'mobile') {
        injector.add([UniverSheetsFindReplaceMobileUIPlugin, {
            useFactory: function createMobilePlugin(currentInjector: Injector) {
                return currentInjector.createInstance(UniverSheetsFindReplaceMobileUIPlugin, {});
            },
            deps: [Injector],
        }]);
        injector.get(UniverSheetsFindReplaceMobileUIPlugin).onStarting();
    } else {
        injector.add([SheetsFindReplaceController]);
    }
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'finder-workbook',
        name: 'Finder workbook',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['finder-sheet'],
        sheets: {
            'finder-sheet': {
                id: 'finder-sheet',
                name: 'Orders',
                rowCount: 10,
                columnCount: 10,
                cellData: {
                    0: { 0: { v: 'target' }, 1: { v: 'TARGET' }, 2: { v: 'target suffix' } },
                    1: { 0: { f: '=A1&" formula"', v: 'target formula' } },
                },
            },
        },
    });
    injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    const renderManager = injector.get(IRenderManagerService);
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetScrollManagerService]);
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetsScrollRenderController]);
    renderManager.createRender(workbook.getUnitId());
    injector.get(ICommandService).registerCommand(ScrollToCellCommand);
    if (pluginMode === 'desktop') {
        injector.get(UniverSheetsFindReplacePlugin).onReady();
    } else if (pluginMode === 'mobile') {
        injector.get(UniverSheetsFindReplaceMobileUIPlugin).onReady();
    } else {
        injector.get(SheetsFindReplaceController);
    }
    const api = FUniver.newAPI(univer);
    api.getActiveWorkbook()!.getActiveSheet()!.getRange('A1').activate();
    return { univer, workbook, api };
}

async function completes<T>(promise: Promise<T>, operation: string): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([
            promise,
            new Promise<never>((_resolve, reject) => {
                timeout = setTimeout(() => reject(new Error(`${operation} did not complete`)), 1_000);
            }),
        ]);
    } finally {
        clearTimeout(timeout);
    }
}

function addresses(finder: IFTextFinder) {
    return finder.findAll().map((range) => range.getA1Notation());
}

describe('FTextFinder real workbook completion', () => {
    let runtime: ReturnType<typeof createRuntime> | undefined;
    let finder: FTextFinder | null | undefined;

    beforeEach(() => {
        // Happy DOM has no canvas renderer; search and replacement still use their real services and models.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return {
                canvas: this,
                setTransform: () => {},
                clearRect: () => {},
                measureText: (text: string) => ({
                    width: text.length * 8,
                    actualBoundingBoxAscent: 10,
                    actualBoundingBoxDescent: 2,
                    fontBoundingBoxAscent: 10,
                    fontBoundingBoxDescent: 2,
                }),
            } as unknown as CanvasRenderingContext2D;
        });
    });

    afterEach(() => {
        finder?.dispose();
        runtime?.univer.__getInjector().get(IFindReplaceService).getProviders().forEach((provider) => provider.terminate());
        runtime?.univer.dispose();
        finder = undefined;
        runtime = undefined;
        vi.restoreAllMocks();
    });

    it.each(['desktop', 'mobile'] as const)('the %s plugin makes public search available at Ready', async (mode) => {
        runtime = createRuntime(mode);
        expect(runtime.univer.__getInjector().get(LifecycleService).stage).toBe(LifecycleStages.Ready);
        finder = await completes(runtime.api.createTextFinderAsync('target'), 'Ready public search');
        expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1', 'A2']);
        expect(await completes(finder!.matchEntireCellAsync(true), 'Ready entire-cell search')).toBe(finder);
        expect(addresses(finder!)).toEqual(['A1', 'B1']);
        expect(await finder!.replaceAllWithAsync('restored')).toBe(2);
        expect(runtime.workbook.getActiveSheet()!.getCellRaw(0, 0)?.v).toBe('restored');
        expect(runtime.workbook.getActiveSheet()!.getCellRaw(0, 1)?.v).toBe('restored');
        expect(runtime.workbook.getActiveSheet()!.getCellRaw(0, 2)?.v).toBe('target suffix');
    });

    it('returns real matches, navigates, replaces and searches again', async () => {
        runtime = createRuntime();
        finder = await runtime.api.createTextFinderAsync('target');
        expect(finder).not.toBeNull();
        expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1', 'A2']);
        expect(finder!.findNext()?.getA1Notation()).toBe('B1');
        expect(finder!.findPrevious()?.getA1Notation()).toBe('A1');
        expect(finder!.getCurrentMatch()?.getA1Notation()).toBe('A1');
        expect(await finder!.replaceAllWithAsync('changed')).toBe(3);
        expect(runtime.workbook.getActiveSheet()!.getCellRaw(0, 0)?.v).toBe('changed');
        expect(runtime.workbook.getActiveSheet()!.getCellRaw(1, 0)?.f).toBe('=A1&" formula"');
        finder!.dispose();
        finder = await runtime.api.createTextFinderAsync('changed');
        expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1']);
        expect(await finder!.replaceWithAsync('restored')).toBe(true);
        expect(runtime.workbook.getActiveSheet()!.getCellRaw(0, 0)?.v).toBe('restored');
    });

    const changedMatches = {
        matchFormulaTextAsync: ['A1', 'B1', 'C1'],
        matchEntireCellAsync: ['A1', 'B1'],
        matchCaseAsync: ['A1', 'C1', 'A2'],
    };
    for (const operation of ['matchFormulaTextAsync', 'matchEntireCellAsync', 'matchCaseAsync'] as const) {
        it(`${operation} completes for unchanged default and repeated options on a settled finder`, async () => {
            runtime = createRuntime();
            finder = await runtime.api.createTextFinderAsync('target');
            expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1', 'A2']);
            const original = Tools.deepClone(runtime.workbook.getSnapshot());
            // Let the real model's throttled initial search complete before setting the same default again.
            await new Promise((resolve) => setTimeout(resolve, 450));
            expect(await completes(finder![operation](false), `${operation}(false)`)).toBe(finder);
            expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1', 'A2']);
            await completes(finder![operation](true), `${operation}(true)`);
            expect(addresses(finder!)).toEqual(changedMatches[operation]);
            await completes(finder![operation](true), `${operation}(true) repeated`);
            expect(addresses(finder!)).toEqual(changedMatches[operation]);
            await completes(finder![operation](false), `${operation}(false) restored`);
            expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1', 'A2']);
            await new Promise((resolve) => setTimeout(resolve, 450));
            expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1', 'A2']);
            expect(runtime.workbook.getSnapshot()).toEqual(original);
            expect(await finder!.replaceAllWithAsync('changed')).toBe(3);
            expect(runtime.workbook.getActiveSheet()!.getCellRaw(0, 0)?.v).toBe('changed');
            expect(runtime.workbook.getActiveSheet()!.getCellRaw(1, 0)?.f).toBe('=A1&" formula"');
        });
    }

    for (const query of ['', 'missing']) {
        it(`option changes complete without writes for ${query === '' ? 'empty' : 'unmatched'} searches and a fresh finder recovers`, async () => {
            runtime = createRuntime();
            finder = await runtime.api.createTextFinderAsync(query);
            const original = Tools.deepClone(runtime.workbook.getSnapshot());
            expect(addresses(finder!)).toEqual([]);
            for (const operation of ['matchFormulaTextAsync', 'matchEntireCellAsync', 'matchCaseAsync'] as const) {
                expect(await completes(finder![operation](true), `${operation}(true), query=${query}`)).toBe(finder);
                expect(addresses(finder!)).toEqual([]);
                expect(await completes(finder![operation](false), `${operation}(false), query=${query}`)).toBe(finder);
                expect(addresses(finder!)).toEqual([]);
            }
            expect(await finder!.replaceAllWithAsync('changed')).toBe(0);
            expect(runtime.workbook.getSnapshot()).toEqual(original);
            finder!.dispose();
            finder = await runtime.api.createTextFinderAsync('target');
            expect(addresses(finder!)).toEqual(['A1', 'B1', 'C1', 'A2']);
            expect(await finder!.replaceAllWithAsync('changed')).toBe(3);
            expect(runtime.workbook.getActiveSheet()!.getCellRaw(0, 0)?.v).toBe('changed');
        });
    }
});
