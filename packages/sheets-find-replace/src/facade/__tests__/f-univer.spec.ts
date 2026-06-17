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

import type { IWorkbookData } from '@univerjs/core';
import type { IFindMatch, IFindQuery, IReplaceAllResult } from '@univerjs/find-replace';
import type { Observable } from 'rxjs';
import { ILogService, Inject, Injector, IUniverInstanceService, LocaleType, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { FindModel, FindReplaceService, IFindReplaceService } from '@univerjs/find-replace';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { EMPTY, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import '../f-univer';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'find-replace-workbook',
    appVersion: '3.0.0-alpha',
    name: 'Find Replace Workbook',
    locale: LocaleType.EN_US,
    sheetOrder: ['sheet-1'],
    styles: {},
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Sheet1',
            rowCount: 10,
            columnCount: 10,
            cellData: {
                0: {
                    1: { v: 'target value' },
                },
                2: {
                    0: { v: 'other value' },
                },
            },
        },
    },
};

class TestWorkbookFindModel extends FindModel {
    readonly unitId = WORKBOOK_DATA.id;
    readonly matchesUpdate$: Observable<IFindMatch[]>;
    readonly activelyChangingMatch$: Observable<IFindMatch> = EMPTY;

    private readonly _matches: IFindMatch[];

    constructor(private readonly _query: IFindQuery) {
        super();

        this._matches = this._query.findString === 'target'
            ? [
                {
                    provider: 'test-workbook-provider',
                    unitId: WORKBOOK_DATA.id,
                    range: {
                        subUnitId: 'sheet-1',
                        range: {
                            startRow: 0,
                            endRow: 0,
                            startColumn: 1,
                            endColumn: 1,
                        },
                    },
                    replaceable: true,
                },
            ]
            : [];
        this.matchesUpdate$ = of(this._matches);
    }

    getMatches(): IFindMatch[] {
        return this._matches;
    }

    moveToNextMatch(): IFindMatch | null {
        return this._matches[0] ?? null;
    }

    moveToPreviousMatch(): IFindMatch | null {
        return this._matches[0] ?? null;
    }

    replace(): Promise<boolean> {
        return Promise.resolve(this._matches.length > 0);
    }

    replaceAll(): Promise<IReplaceAllResult> {
        return Promise.resolve({ success: this._matches.length, failure: 0 });
    }

    focusSelection(): void {}
}

class TestWorkbookFindReplaceProvider {
    constructor(@Inject(Injector) private readonly _injector: Injector) {}

    find(query: IFindQuery): Promise<FindModel[]> {
        return Promise.resolve([this._injector.createInstance(TestWorkbookFindModel, query)]);
    }

    terminate(): void {}
}

function createFindReplaceFacade() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    univer.registerPlugin(UniverSheetsPlugin);

    const workbook = univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA);
    injector.add([IFindReplaceService, { useClass: FindReplaceService }]);
    injector.add([TestWorkbookFindReplaceProvider]);

    const findReplaceService = injector.get(IFindReplaceService);
    findReplaceService.registerFindReplaceProvider(injector.get(TestWorkbookFindReplaceProvider));
    injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    return FUniver.newAPI(univer);
}

describe('FUniverSheetsFindReplaceMixin', () => {
    it('creates a text finder that searches the focused workbook', async () => {
        const univerAPI = createFindReplaceFacade();

        const finder = await univerAPI.createTextFinderAsync('target');
        const matches = finder?.findAll() ?? [];

        expect(matches.map((range) => range.getA1Notation())).toEqual(['B1']);
    });
});
