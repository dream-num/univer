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

import type { IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    RegionService,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    INumfmtService,
    NumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesMutation,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SetCurrencyCommand, SetNumfmtCommand, SetPercentCommand } from '@univerjs/sheets-numfmt';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import zhCN from '../../locale/zh-CN';
import { CurrencySymbolIconMenuItem, FactoryOtherMenuItem, PercentMenuItem } from '../menu';
import { FactoryMobileOtherMenuItem } from '../mobile-menu';

describe('number format menu state', () => {
    let univer: Univer;
    let workbook: Workbook;
    let commands: ICommandService;
    let selections: SheetsSelectionsService;
    let localeService: LocaleService;
    let subscriptions: Subscription;
    let label: string;
    let mobileLabel: string;
    let currencyActive: boolean;
    let percentActive: boolean;

    function createSelection(row: number, column: number, range?: IRange): ISelectionWithStyle {
        return {
            range: range ?? { startRow: row, endRow: row, startColumn: column, endColumn: column },
            primary: workbook.getActiveSheet().getCellInfoInMergeData(row, column),
            style: null,
        };
    }

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([SheetsSelectionsService]);
        injector.add([INumfmtService, { useClass: NumfmtService }]);
        localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'test',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: '',
            sheetOrder: ['sheet1', 'sheet2'],
            styles: {
                currency: { n: { pattern: '$#,##0.00' } },
                percent: { n: { pattern: '0.000%' } },
            },
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    cellData: { 0: { 0: { v: 1 }, 1: { v: 100.11, s: 'currency' }, 2: { v: 1, s: 'percent' } } },
                },
                sheet2: { id: 'sheet2' },
            },
        });
        injector.get(IUniverInstanceService).focusUnit('test');
        selections = injector.get(SheetsSelectionsService);
        commands = injector.get(ICommandService);
        [
            SetNumfmtMutation,
            RemoveNumfmtMutation,
            SetRangeValuesMutation,
            SetNumfmtCommand,
            SetCurrencyCommand,
            SetPercentCommand,
            SetWorksheetActiveOperation,
        ].forEach((command) => commands.registerCommand(command));
        subscriptions = new Subscription();
        subscriptions.add(FactoryOtherMenuItem(injector).value$!.subscribe((value) => {
            label = value;
        }));
        subscriptions.add(FactoryMobileOtherMenuItem(injector).value$!.subscribe((value) => {
            mobileLabel = value;
        }));
        subscriptions.add(CurrencySymbolIconMenuItem(injector).activated$!.subscribe((value) => {
            currencyActive = value;
        }));
        subscriptions.add(PercentMenuItem(injector).activated$!.subscribe((value) => {
            percentActive = value;
        }));
    });

    afterEach(() => {
        subscriptions.unsubscribe();
        univer.dispose();
    });

    it('uses the focus cell within a range and the last of multiple selections', () => {
        const range = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 };
        selections.setSelections([createSelection(0, 1, range)]);
        expect([label, mobileLabel, currencyActive, percentActive]).toEqual(['Currency', 'Currency', true, false]);

        selections.setSelections([createSelection(0, 2, range)]);
        expect([label, mobileLabel, currencyActive, percentActive]).toEqual(['Percentage', 'Percentage', false, true]);

        selections.setSelections([createSelection(0, 1), createSelection(0, 0)]);
        expect([label, mobileLabel, currencyActive, percentActive]).toEqual(['General', 'General', false, false]);
        selections.setSelections([{ range: createSelection(0, 1).range, primary: null }]);
        expect([label, currencyActive, percentActive]).toEqual(['Currency', true, false]);
        selections.setSelections([]);
        expect([currencyActive, percentActive]).toEqual([false, false]);
    });

    it('updates classification and active buttons immediately after locale changes', () => {
        selections.setSelections([createSelection(0, 1)]);
        expect(label).toBe('Currency');
        localeService.setLocale(LocaleType.ZH_CN);
        expect([label, mobileLabel]).toEqual(['货币', '货币']);
        expect([currencyActive, percentActive]).toEqual([false, false]);
        localeService.setLocale(LocaleType.EN_US);
        expect([label, mobileLabel]).toEqual(['Currency', 'Currency']);
        expect(currencyActive).toBe(true);
    });

    it.each([
        { region: LocaleType.ZH_CN, symbol: '¥', otherRegion: LocaleType.EN_US },
        { region: LocaleType.EN_US, symbol: '$', otherRegion: LocaleType.ZH_CN },
        { region: LocaleType.FR_FR, symbol: '€', otherRegion: LocaleType.EN_US },
        { region: LocaleType.ZH_TW, symbol: 'NT$', otherRegion: LocaleType.EN_US },
        { region: LocaleType.ZH_HK, symbol: 'HK$', otherRegion: LocaleType.EN_US },
        { region: LocaleType.PT_BR, symbol: 'R$', otherRegion: LocaleType.EN_US },
    ])('activates only the matching currency symbol $symbol in $region', async ({ region, symbol, otherRegion }) => {
        const regionService = univer.__getInjector().get(RegionService);
        regionService.setRegion(region);
        selections.setSelections([createSelection(0, 0)]);

        expect(await commands.executeCommand(SetNumfmtCommand.id, {
            values: [{ row: 0, col: 0, pattern: `"${symbol}"#,##0.000` }],
        })).toBe(true);
        expect(currencyActive).toBe(true);
        regionService.setRegion(otherRegion);
        expect(currencyActive).toBe(false);
        expect([label, mobileLabel]).toEqual(['Currency', 'Currency']);
        regionService.setRegion(region);
        expect(currencyActive).toBe(true);

        expect(await commands.executeCommand(SetPercentCommand.id)).toBe(true);
        expect([currencyActive, percentActive]).toEqual([false, true]);
    });

    it('uses the same explicit region as the currency icon when the UI language changes', () => {
        univer.__getInjector().get(RegionService).setRegion(LocaleType.EN_US);
        selections.setSelections([createSelection(0, 1)]);
        localeService.setLocale(LocaleType.ZH_CN);
        expect([label, currencyActive]).toEqual(['货币', true]);
    });

    it('tracks shortcut commands, undo, redo and clearing the format without moving focus', async () => {
        selections.setSelections([createSelection(0, 0)]);
        expect(await commands.executeCommand(SetPercentCommand.id)).toBe(true);
        expect([label, currencyActive, percentActive]).toEqual(['Percentage', false, true]);
        expect(await commands.executeCommand(SetCurrencyCommand.id)).toBe(true);
        expect([label, currencyActive, percentActive]).toEqual(['Currency', true, false]);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect([label, currencyActive, percentActive]).toEqual(['Percentage', false, true]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect([label, currencyActive, percentActive]).toEqual(['Currency', true, false]);
        expect(await commands.executeCommand(SetNumfmtCommand.id, { values: [{ row: 0, col: 0 }] })).toBe(true);
        expect([label, mobileLabel, currencyActive, percentActive]).toEqual(['General', 'General', false, false]);
    });

    it('clears and restores active state when switching sheets or disposing the workbook', () => {
        selections.setSelections([createSelection(0, 1)]);
        selections.setSelections('test', 'sheet2', [createSelection(0, 1)]);
        expect(commands.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet2',
        })).toBe(true);
        expect([label, currencyActive, percentActive]).toEqual(['General', false, false]);
        expect(commands.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);
        expect([label, currencyActive, percentActive]).toEqual(['Currency', true, false]);
        univer.__getInjector().get(IUniverInstanceService).disposeUnit('test');
        expect([currencyActive, percentActive]).toEqual([false, false]);
    });
});
