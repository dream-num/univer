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
import {
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ERROR_RANGE } from '../../types/const';
import { SheetHyperLinkType } from '../../types/enums/hyper-link-type';
import { SheetsHyperLinkParserService } from '../parser.service';

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
                        0: { v: 'Origin' },
                    },
                },
                rowCount: 20,
                columnCount: 20,
            },
        },
    };
}

describe('SheetsHyperLinkParserService', () => {
    let univer: Univer;
    let service: SheetsHyperLinkParserService;
    let localeService: LocaleService;

    beforeEach(() => {
        univer = new Univer();

        const injector = univer.__getInjector();
        injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
        injector.add([SheetsHyperLinkParserService]);

        localeService = injector.get(LocaleService);
        localeService.load({
            [LocaleType.EN_US]: {
                hyperLink: {
                    message: {
                        refError: 'Invalid Range',
                    },
                },
            } as never,
        });
        localeService.setLocale(LocaleType.EN_US);

        service = injector.get(SheetsHyperLinkParserService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should build hyperlinks for sheet, named range and range object', () => {
        const range: IRange = {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        };

        expect(service.buildHyperLink('book-1', 'sheet-1')).toBe('#gid=sheet-1');
        expect(service.buildHyperLink('book-1', 'sheet-1', 'name-1')).toBe('#gid=sheet-1&rangeid=name-1');
        expect(service.buildHyperLink('book-1', 'sheet-1', range)).toBe('#gid=sheet-1&range=A1:B2');
    });

    it('should parse external URLs as url links', () => {
        const url = 'https://univer.ai';

        expect(service.parseHyperLink(url)).toEqual({
            type: SheetHyperLinkType.URL,
            name: url,
            url,
            searchObj: null,
        });
    });

    it('should parse range links from the focused workbook when unitid is absent', () => {
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        const univerInstanceService = univer.__getInjector().get(IUniverInstanceService);
        univerInstanceService.focusUnit(workbook.getUnitId());

        const url = '#gid=sheet-1&range=A1:B2';
        expect(service.parseHyperLink(url)).toEqual({
            type: SheetHyperLinkType.RANGE,
            name: 'Sheet1!A1:B2',
            url,
            searchObj: {
                gid: 'sheet-1',
                range: 'A1:B2',
                rangeid: '',
                unitid: '',
            },
        });
    });

    it('should parse defined name links through the real defined names service', () => {
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        const definedNamesService = univer.__getInjector().get(IDefinedNamesService);

        definedNamesService.registerDefinedName(workbook.getUnitId(), {
            id: 'name-1',
            name: 'Total',
            formulaOrRefString: 'Sheet1!A1:B2',
        });

        const url = `#gid=sheet-1&rangeid=name-1&unitid=${workbook.getUnitId()}`;
        expect(service.parseHyperLink(url)).toEqual({
            type: SheetHyperLinkType.DEFINE_NAME,
            name: 'Sheet1!A1:B2',
            url,
            searchObj: {
                gid: 'sheet-1',
                range: '',
                rangeid: 'name-1',
                unitid: workbook.getUnitId(),
            },
        });
    });

    it('should parse sheet links by sheet id', () => {
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        const url = `#gid=sheet-1&unitid=${workbook.getUnitId()}`;
        expect(service.parseHyperLink(url)).toEqual({
            type: SheetHyperLinkType.SHEET,
            name: 'Sheet1',
            url,
            searchObj: {
                gid: 'sheet-1',
                range: '',
                rangeid: '',
                unitid: workbook.getUnitId(),
            },
        });
    });

    it('should return invalid for missing workbook, invalid range and missing defined names', () => {
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        expect(service.parseHyperLink('#gid=sheet-1&range=A1&unitid=missing').type).toBe(SheetHyperLinkType.INVALID);
        expect(service.parseHyperLink(`#gid=sheet-1&range=${ERROR_RANGE}&unitid=book-1`).type).toBe(SheetHyperLinkType.INVALID);
        expect(service.parseHyperLink('#gid=sheet-1&rangeid=missing&unitid=book-1')).toEqual({
            type: SheetHyperLinkType.INVALID,
            name: 'Invalid Range',
            url: '#gid=sheet-1&rangeid=missing&unitid=book-1',
            searchObj: {
                gid: 'sheet-1',
                range: '',
                rangeid: 'missing',
                unitid: 'book-1',
            },
        });
    });
});
