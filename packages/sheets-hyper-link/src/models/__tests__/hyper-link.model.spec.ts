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
import type { ISheetHyperLink } from '../../types/interfaces/i-hyper-link';
import { IUniverInstanceService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HyperLinkModel } from '../hyper-link.model';

function createWorkbookData(unitId = 'book-1', sheetId = 'sheet-1'): IWorkbookData {
    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Workbook',
        sheetOrder: [sheetId],
        styles: {},
        sheets: {
            [sheetId]: {
                id: sheetId,
                name: 'Sheet1',
                cellData: {
                    0: {
                        0: { v: 'Display From Cell' },
                        1: { v: 'Other Cell' },
                    },
                    1: {
                        1: { v: 'Moved Cell' },
                    },
                },
                rowCount: 20,
                columnCount: 20,
            },
        },
    };
}

function createLink(id: string, row: number, column: number, payload = 'https://univer.ai'): ISheetHyperLink {
    return {
        id,
        row,
        column,
        payload,
        display: `${id}-display`,
    };
}

describe('HyperLinkModel', () => {
    let univer: Univer;
    let model: HyperLinkModel;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();

        injector.add([HyperLinkModel]);
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        injector.get(IUniverInstanceService).focusUnit('book-1');

        model = injector.get(HyperLinkModel);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should add, update, remove and unload hyperlinks while emitting update events', () => {
        const link = createLink('link-1', 0, 0);
        const events: string[] = [];

        model.linkUpdate$.subscribe((event) => {
            events.push(event.type);
        });

        expect(model.addHyperLink('book-1', 'sheet-1', link)).toBe(true);
        expect(model.getHyperLink('book-1', 'sheet-1', 'link-1')).toEqual(link);

        expect(model.updateHyperLink('book-1', 'sheet-1', 'link-1', { payload: 'https://docs.univer.ai' }, true)).toBe(true);
        expect(model.getHyperLink('book-1', 'sheet-1', 'link-1')?.payload).toBe('https://docs.univer.ai');

        expect(model.removeHyperLink('book-1', 'sheet-1', 'link-1')).toBe(true);
        expect(model.removeHyperLink('book-1', 'sheet-1', 'missing')).toBe(false);

        model.deleteUnit('book-1');

        expect(events).toEqual(['add', 'update', 'remove', 'unload']);
        expect(model.getUnit('book-1')).toEqual([]);
        expect(model.getAll()).toEqual([]);
    });

    it('should move hyperlink references and clear the original matrix position when the original link is still there', () => {
        const link = createLink('link-1', 0, 0);

        model.addHyperLink('book-1', 'sheet-1', link);
        expect(model.updateHyperLinkRef('book-1', 'sheet-1', 'link-1', { row: 1, column: 1 }, true)).toBe(true);

        expect(model.getHyperLinkByLocation('book-1', 'sheet-1', 0, 0)).toBeUndefined();
        expect(model.getHyperLinkByLocation('book-1', 'sheet-1', 1, 1)).toEqual({
            ...link,
            row: 1,
            column: 1,
        });
    });

    it('should move hyperlink references from the cached position when the matrix slot has been overwritten', () => {
        const original = createLink('original', 0, 0, 'https://origin');
        const overwritten = createLink('overwritten', 0, 0, 'https://other');

        model.addHyperLink('book-1', 'sheet-1', original);
        model.addHyperLink('book-1', 'sheet-1', overwritten);
        model.updateHyperLinkRef('book-1', 'sheet-1', 'original', { row: 1, column: 1 });

        expect(model.getHyperLink('book-1', 'sheet-1', 'original')).toEqual({
            ...original,
            row: 1,
            column: 1,
        });
        expect(model.getHyperLinkByLocation('book-1', 'sheet-1', 0, 0)).toEqual(overwritten);
    });

    it('should resolve display text from worksheet cells when reading synchronously by location', () => {
        const link = createLink('link-1', 0, 0);

        model.addHyperLink('book-1', 'sheet-1', link);

        expect(model.getHyperLinkByLocationSync('book-1', 'sheet-1', 0, 0)).toEqual({
            ...link,
            display: 'Display From Cell',
        });
        expect(model.getHyperLinkByLocationSync('book-1', 'sheet-1', 9, 9)).toBeUndefined();
    });

    it('should expose links by sub unit and whole unit', () => {
        const first = createLink('link-1', 0, 0);
        const second = createLink('link-2', 1, 1);

        model.addHyperLink('book-1', 'sheet-1', first);
        model.addHyperLink('book-1', 'sheet-1', second);

        expect(model.getSubUnit('book-1', 'sheet-1')).toEqual([first, second]);
        expect(model.getUnit('book-1')).toEqual([
            {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                links: [first, second],
            },
        ]);
        expect(model.getAll()).toEqual([
            [
                {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    links: [first, second],
                },
            ],
        ]);
    });
});
