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
    Direction,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { InsertRowByRangeCommand, UniverSheetsPlugin } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import { AddHyperLinkCommand } from '../../commands/commands/add-hyper-link.command';
import enUS from '../../locale/en-US';
import { UniverSheetsHyperLinkPlugin } from '../../plugin';

describe('SheetsHyperLinkRichTextRefRangeController', () => {
    it('retains the destination worksheet ID when a row is inserted in another sheet', async () => {
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            const locale = injector.get(LocaleService);
            locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.registerPlugin(UniverSheetsPlugin);
            univer.registerPlugin(UniverSheetsHyperLinkPlugin);
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'main',
                name: 'Hyperlink workbook',
                appVersion: 'test',
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['orders', 'summary'],
                sheets: {
                    orders: { id: 'orders', name: 'Orders', rowCount: 20, columnCount: 20, cellData: {} },
                    summary: { id: 'summary', name: 'Summary', rowCount: 20, columnCount: 20, cellData: {} },
                },
            });
            const commands = injector.get(ICommandService);
            injector.get(IUniverInstanceService).focusUnit('main');
            expect(await commands.executeCommand(AddHyperLinkCommand.id, {
                unitId: 'main',
                subUnitId: 'orders',
                link: { id: 'cross-sheet', row: 1, column: 9, payload: '#gid=summary&range=B3', display: 'Target' },
            })).toBe(true);
            const linkUrl = () => workbook.getSheetBySheetId('orders')?.getCellRaw(1, 9)?.p?.body?.customRanges?.[0]?.properties?.url;
            expect(linkUrl()).toBe('#gid=summary&range=B3');
            expect(await commands.executeCommand(InsertRowByRangeCommand.id, {
                unitId: 'main',
                subUnitId: 'summary',
                direction: Direction.UP,
                range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 19 },
            })).toBe(true);
            expect(linkUrl()).toBe('#gid=summary&range=B4');
            expect(await commands.executeCommand(UndoCommand.id, { unitId: 'main' })).toBe(true);
            expect(linkUrl()).toBe('#gid=summary&range=B3');
            expect(await commands.executeCommand(RedoCommand.id, { unitId: 'main' })).toBe(true);
            expect(linkUrl()).toBe('#gid=summary&range=B4');
        } finally {
            univer.dispose();
        }
    });
});
