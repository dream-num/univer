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

import type { Dependency, IWorkbookData, Worksheet } from '@univerjs/core';

import type { IFindQuery } from '@univerjs/find-replace';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Univer } from '@univerjs/core';
import { FindBy, FindDirection, FindScope } from '@univerjs/find-replace';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hitCell } from '../sheet-find-replace.controller';
import {
    isBeforePositionWithColumnPriority,
    isBeforePositionWithRowPriority,
    isBehindPositionWithColumnPriority,
    isBehindPositionWithRowPriority,
    isSamePosition,
} from '../utils';

describe('Test sheet find replace utils', () => {
    it('Should "isSamePosition" work as expected', () => {
        expect(
            isSamePosition(
                { startRow: 12, endColumn: 24, startColumn: 22, endRow: 25 },
                { startRow: 12, endRow: 23, startColumn: 22, endColumn: 28 }
            )
        ).toBeTruthy();

        expect(
            isSamePosition(
                { startRow: 13, endColumn: 24, startColumn: 22, endRow: 25 },
                { startRow: 12, endRow: 23, startColumn: 22, endColumn: 28 }
            )
        ).toBeFalsy();

        expect(
            isSamePosition(
                { startRow: 12, endColumn: 24, startColumn: 24, endRow: 25 },
                { startRow: 12, endRow: 23, startColumn: 22, endColumn: 28 }
            )
        ).toBeFalsy();
    });

    it('Should "isBehindPositionWithRowPriority" work as expected', () => {
        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeFalsy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }
            )
        ).toBeFalsy();
    });

    it('Should "isBehindPositionWithColumnPriority" work as expected', () => {
        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeFalsy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeFalsy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();
    });

    it('Should "isBeforePositionWithRowPriority" work as expected', () => {
        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeFalsy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeFalsy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }
            )
        ).toBeTruthy();
    });

    it('Should "isBeforePositionWithColumnPriority" work as expected', () => {
        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeFalsy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }
            )
        ).toBeFalsy();
    });
});

describe('test "hitCell" method', () => {
    let univer: Univer;
    let worksheet: Worksheet;

    beforeEach(() => {
        const testBed = createTestBed();
        univer = testBed.univer;
        worksheet = testBed.sheet.getActiveSheet()!;
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('hitting formulas', () => {
        describe('replaceable if only searching for raw formulas', () => {
            it('should be replaceable when searching for formulas and formula string matches', () => {
                const query: IFindQuery = {
                    findString: '6',
                    caseSensitive: false,
                    findBy: FindBy.FORMULA,
                    findDirection: FindDirection.COLUMN,
                    findScope: FindScope.SUBUNIT,
                    matchesTheWholeCell: false,
                    replaceRevealed: false,
                };

                // If search by formula, when the formula string failed to match, the cell should not be hit.
                const result1 = hitCell(worksheet, 0, 0, query, TEST_WORKBOOK_DATA.sheets.sheet1.cellData![0][0]);
                expect(result1.hit).toBeFalsy();
                expect(result1.replaceable).toBeFalsy();

                const result2 = hitCell(worksheet, 0, 1, query, TEST_WORKBOOK_DATA.sheets.sheet1.cellData![0][1]);
                expect(result2.hit).toBeTruthy();
                expect(result2.replaceable).toBeTruthy();
            });
        });

        it('formula string should support "caseSensitive" option', () => {
            const query: IFindQuery = {
                findString: 'sum',
                caseSensitive: true,
                findBy: FindBy.FORMULA,
                findDirection: FindDirection.COLUMN,
                findScope: FindScope.SUBUNIT,
                matchesTheWholeCell: false,
                replaceRevealed: false,
            };

            const result1 = hitCell(worksheet, 0, 1, query, TEST_WORKBOOK_DATA.sheets.sheet1.cellData![0][1]);
            expect(result1.hit).toBeFalsy();
            expect(result1.replaceable).toBeFalsy();

            const result2 = hitCell(worksheet, 0, 2, query, TEST_WORKBOOK_DATA.sheets.sheet1.cellData![0][2]);
            expect(result2.hit).toBeTruthy();
            expect(result2.replaceable).toBeTruthy();

            // If we unset 'caseSensitive' and [0][1] should match!
            query.caseSensitive = false;
            const result3 = hitCell(worksheet, 0, 1, query, TEST_WORKBOOK_DATA.sheets.sheet1.cellData![0][1]);
            expect(result3.hit).toBeTruthy();
            expect(result3.replaceable).toBeTruthy();
        });
    });
});

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 6,
                        f: '=SUM(3, 3)',
                    },
                    1: {
                        v: 9,
                        f: '=SUM(6, 3)',
                    },
                    2: {
                        v: 9,
                        f: '=sum(6, 3)', // test case sensitive
                    },
                    3: {
                        v: 66,
                    },
                },
            },
            name: 'Sheet-001',
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

function createTestBed(dependencies?: Dependency[]) {
    const univer = new Univer();

    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    dependencies?.forEach((d) => injector.add(d));

    const sheet = univer.createUniverSheet(TEST_WORKBOOK_DATA);
    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit(TEST_WORKBOOK_DATA.id);

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        sheet,
    };
}
