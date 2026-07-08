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

import type { Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import type { LexerNode } from '../lexer-node';
import { LocaleType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IDefinedNamesService } from '../../../services/defined-names.service';
import { Lexer } from '../lexer';
import { LexerTreeBuilder } from '../lexer-tree-builder';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheetName1',
            cellData: {
                0: {
                    0: {
                        v: 1,
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

describe('lexer test', () => {
    let univer: Univer;
    let lexer: Lexer;
    let get: Injector['get'];
    let workbook: Workbook;
    let definedNamesService: IDefinedNamesService;
    let formulaCurrentConfigService: IFormulaCurrentConfigService;
    let lexerTreeBuilder: LexerTreeBuilder;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA);
        univer = testBed.univer;
        workbook = testBed.sheet;
        get = testBed.get;

        definedNamesService = get(IDefinedNamesService);
        formulaCurrentConfigService = get(IFormulaCurrentConfigService);
        lexerTreeBuilder = get(LexerTreeBuilder);

        formulaCurrentConfigService.setExecuteUnitId('test');
        formulaCurrentConfigService.setExecuteSubUnitId('sheet1');
        formulaCurrentConfigService.setSheetNameMap({ test: { sheet1: 'sheetName1' } });

        // runtimeService.setCurrent(0, 0, 4, 1, 'sheet1', 'test');

        lexer = new Lexer(
            definedNamesService,
            lexerTreeBuilder,
            formulaCurrentConfigService
        );
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('lexer definedName', () => {
        it('simple', () => {
            definedNamesService.registerDefinedName('test', {
                id: 'test1',
                name: 'myName',
                formulaOrRefString: '$A$10:$C$100',
            });

            const node = lexer.treeBuilder('=myName') as LexerNode;

            expect(node.serialize()).toStrictEqual({
                token: 'R_1',
                st: -1,
                ed: -1,
                children: [
                    {
                        token: ':',
                        st: -1,
                        ed: -1,
                        children: [
                            {
                                token: 'P_1',
                                st: -1,
                                ed: -1,
                                children: [
                                    {
                                        token: '$A$10',
                                        st: 0,
                                        ed: 4,
                                        children: [],
                                    },
                                ],
                            },
                            {
                                token: 'P_1',
                                st: -1,
                                ed: -1,
                                children: [
                                    {
                                        token: '$C$100',
                                        st: -1,
                                        ed: -1,
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it('resolves workbook defined names that point to sheets with underscores', () => {
            formulaCurrentConfigService.setSheetNameMap({
                test: {
                    sheet1: 'sheetName1',
                    sheet2: 'Parameters_Constants',
                },
            });
            definedNamesService.registerDefinedName('test', {
                id: 'test-underscore-sheet',
                name: 'CONST_GJpt',
                formulaOrRefString: 'Parameters_Constants!$B$28',
                localSheetId: 'AllDefaultWorkbook',
            });

            const node = lexer.treeBuilder('=CONST_GJpt') as LexerNode;

            expect(JSON.stringify(node.serialize())).toContain('Parameters_Constants!$B$28');
            expect(JSON.stringify(node.serialize())).not.toContain('#NAME?');
        });

        it('resolves defined names case-insensitively', () => {
            definedNamesService.registerDefinedName('test', {
                id: 'test-case-insensitive',
                name: 'CONST_kNm3',
                formulaOrRefString: '$B$27',
                localSheetId: 'AllDefaultWorkbook',
            });

            const node = lexer.treeBuilder('=CONST_KNM3') as LexerNode;

            expect(JSON.stringify(node.serialize())).toContain('$B$27');
            expect(JSON.stringify(node.serialize())).not.toContain('#NAME?');
        });

        it('prefers sheet-local defined names over workbook defined names', () => {
            formulaCurrentConfigService.setExecuteSubUnitId('sheet-weekly');
            formulaCurrentConfigService.setSheetNameMap({
                test: {
                    'sheet-weekly': 'Weekly',
                    'sheet-report': 'Report',
                },
            });
            definedNamesService.registerDefinedName('test', {
                id: 'date-begin-local',
                name: 'date_begin',
                formulaOrRefString: 'Weekly!$F$4',
                localSheetId: 'sheet-weekly',
            });
            definedNamesService.registerDefinedName('test', {
                id: 'date-begin-global',
                name: 'date_begin',
                formulaOrRefString: 'Report!$F$4',
                localSheetId: 'AllDefaultWorkbook',
            });

            const node = lexer.treeBuilder('=date_begin+6') as LexerNode;
            const serialized = JSON.stringify(node.serialize());

            expect(serialized).toContain('Weekly!$F$4');
            expect(serialized).not.toContain('Report!$F$4');
        });

        it('resolves defined names next to operators and spaces', () => {
            definedNamesService.registerDefinedName('test', {
                id: 'test-operator-left',
                name: 'CONST_GJ',
                formulaOrRefString: '$B$25',
                localSheetId: 'AllDefaultWorkbook',
            });
            definedNamesService.registerDefinedName('test', {
                id: 'test-operator-right',
                name: 'CONST_t',
                formulaOrRefString: '$B$26',
                localSheetId: 'AllDefaultWorkbook',
            });

            const node = lexer.treeBuilder('=CONST_GJ & "/" &CONST_t') as LexerNode;
            const serialized = JSON.stringify(node.serialize());

            expect(serialized).toContain('$B$25');
            expect(serialized).toContain('$B$26');
            expect(serialized).not.toContain('#NAME?');
        });

        it('lambda', () => {
            definedNamesService.registerDefinedName('test', {
                id: 'test2',
                name: 'myName',
                formulaOrRefString: 'lambda(x, y , x*x*y)',
            });

            const node = lexer.treeBuilder(
                '=myName(1+sum(A1:B1), 100)'
            ) as LexerNode;
            expect(node.serialize()).toStrictEqual({
                token: 'R_1',
                st: -1,
                ed: -1,
                children: [
                    {
                        token: 'lambda',
                        st: 0,
                        ed: 5,
                        children: [
                            {
                                token: 'L_1',
                                st: 16,
                                ed: 18,
                                children: [
                                    {
                                        token: 'P_1',
                                        st: 17,
                                        ed: 19,
                                        children: [
                                            '1',
                                            {
                                                token: 'sum',
                                                st: 23,
                                                ed: 25,
                                                children: [
                                                    {
                                                        token: 'P_1',
                                                        st: 23,
                                                        ed: 25,
                                                        children: [
                                                            {
                                                                token: ':',
                                                                st: -1,
                                                                ed: -1,
                                                                children: [
                                                                    {
                                                                        token: 'P_1',
                                                                        st: -1,
                                                                        ed: -1,
                                                                        children:
                                                                            [
                                                                                {
                                                                                    token: 'A1',
                                                                                    st: 27,
                                                                                    ed: 28,
                                                                                    children:
                                                                                        [],
                                                                                },
                                                                            ],
                                                                    },
                                                                    {
                                                                        token: 'P_1',
                                                                        st: -1,
                                                                        ed: -1,
                                                                        children:
                                                                            [
                                                                                {
                                                                                    token: 'B1',
                                                                                    st: -1,
                                                                                    ed: -1,
                                                                                    children:
                                                                                        [],
                                                                                },
                                                                            ],
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            '+',
                                        ],
                                    },
                                    {
                                        token: 'P_1',
                                        st: 30,
                                        ed: 32,
                                        children: ['100'],
                                    },
                                ],
                            },
                            { token: 'P_1', st: 3, ed: 5, children: ['x'] },
                            { token: 'P_1', st: 5, ed: 7, children: ['y '] },
                            {
                                token: 'P_1',
                                st: 9,
                                ed: 11,
                                children: ['x', 'x', '*', 'y', '*'],
                            },
                        ],
                    },
                ],
            });
        });

        it('defined name nest struct', () => {
            definedNamesService.registerDefinedName('test', {
                id: 'test1',
                name: 'myName1',
                localSheetId: 'sheet1',
                formulaOrRefString: '$A$10:$C$100',
            });

            definedNamesService.registerDefinedName('test', {
                id: 'test2',
                name: 'myName2',
                formulaOrRefString: '=sheetName1!myName1 + 100',
            });

            definedNamesService.registerDefinedName('test', {
                id: 'test3',
                name: 'myName3',
                formulaOrRefString: '=myName2',
            });

            const node = lexer.treeBuilder('=myName3') as LexerNode;

            expect(node.serialize()).toStrictEqual({
                children: [
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [],
                                        ed: 4,
                                        st: 0,
                                        token: '$A$10',
                                    },
                                ],
                                ed: -1,
                                st: -1,
                                token: 'P_1',
                            },
                            {
                                children: [
                                    {
                                        children: [],
                                        ed: -1,
                                        st: -1,
                                        token: '$C$100',
                                    },
                                ],
                                ed: -1,
                                st: -1,
                                token: 'P_1',
                            },
                        ],
                        ed: -1,
                        st: -1,
                        token: ':',
                    },
                    '100',
                    '+',
                ],
                ed: -1,
                st: -1,
                token: 'R_1',
            });
        });
    });
});
