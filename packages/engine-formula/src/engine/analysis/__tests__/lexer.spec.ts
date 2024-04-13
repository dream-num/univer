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

import type { IWorkbookData, Univer, Workbook } from '@univerjs/core';
import { AbsoluteRefType, IUniverInstanceService, LocaleType } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { IDefinedNamesService } from '../../../services/defined-names.service';
import { Lexer } from '../lexer';
import type { LexerNode } from '../lexer-node';
import { LexerTreeBuilder } from '../lexer-tree-builder';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
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
    let univerInstanceService: IUniverInstanceService;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA);
        univer = testBed.univer;
        workbook = testBed.sheet;
        get = testBed.get;

        definedNamesService = get(IDefinedNamesService);
        formulaCurrentConfigService = get(IFormulaCurrentConfigService);
        lexerTreeBuilder = get(LexerTreeBuilder);
        univerInstanceService = get(IUniverInstanceService);

        formulaCurrentConfigService.setExecuteUnitId('test');
        formulaCurrentConfigService.setExecuteSubUnitId('sheet1');

        // runtimeService.setCurrent(0, 0, 4, 1, 'sheet1', 'test');

        lexer = new Lexer(definedNamesService, lexerTreeBuilder, formulaCurrentConfigService, univerInstanceService);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('lexer definedName', () => {
        it('simple', () => {
            definedNamesService.registerDefinedName('test', { id: 'test1', name: 'myName', formulaOrRefString: '$A$10:$C$100' });

            const node = lexer.treeBuilder('=myName') as LexerNode;

            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"$A$10","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"$C$100","st":-1,"ed":-1,"children":[]}]}]}]}'
            );
        });

        it('lambda', () => {
            definedNamesService.registerDefinedName('test', { id: 'test2', name: 'myName', formulaOrRefString: 'lambda(x, y , x*x*y)' });

            const node = lexer.treeBuilder('=myName(1+sum(A1:B1), 100)') as LexerNode;

            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"lambda","st":0,"ed":5,"children":[{"token":"L_1","st":16,"ed":18,"children":[{"token":"P_1","st":17,"ed":19,"children":["1",{"token":"sum","st":23,"ed":25,"children":[{"token":"P_1","st":23,"ed":25,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]}]}]}]},"+"]},{"token":"P_1","st":30,"ed":32,"children":[" 100"]}]},{"token":"P_1","st":3,"ed":5,"children":["x"]},{"token":"P_1","st":5,"ed":7,"children":[" y "]},{"token":"P_1","st":9,"ed":11,"children":[" x","x","*","y","*"]}]}]}'
            );
        });
    });

    describe('convertRefersToAbsolute', () => {
        it('Formula All', () => {
            const result = lexer.convertRefersToAbsolute('=sum(A1:B1,A1:B1,A1:B1,A1:B1)', AbsoluteRefType.ALL, AbsoluteRefType.ALL);
            expect(result).toStrictEqual('=sum($A$1:$B$1,$A$1:$B$1,$A$1:$B$1,$A$1:$B$1)');
        });

        it('Range All', () => {
            const result = lexer.convertRefersToAbsolute('A1:B1,A1:B1,A1:B1,A1:B1', AbsoluteRefType.ALL, AbsoluteRefType.ALL);
            expect(result).toStrictEqual('$A$1:$B$1,$A$1:$B$1,$A$1:$B$1,$A$1:$B$1');
        });

        it('Formula Column', () => {
            const result = lexer.convertRefersToAbsolute('=sum(A1:B1,A1:B1,A1:B1,A1:B1)', AbsoluteRefType.COLUMN, AbsoluteRefType.COLUMN);
            expect(result).toStrictEqual('=sum($A1:$B1,$A1:$B1,$A1:$B1,$A1:$B1)');
        });

        it('Range Column', () => {
            const result = lexer.convertRefersToAbsolute('A1:B1,A1:B1,A1:B1,A1:B1', AbsoluteRefType.COLUMN, AbsoluteRefType.COLUMN);
            expect(result).toStrictEqual('$A1:$B1,$A1:$B1,$A1:$B1,$A1:$B1');
        });

        it('Formula Row', () => {
            const result = lexer.convertRefersToAbsolute('=sum(A1:B1,A1:B1,A1:B1,A1:B1)', AbsoluteRefType.ROW, AbsoluteRefType.ROW);
            expect(result).toStrictEqual('=sum(A$1:B$1,A$1:B$1,A$1:B$1,A$1:B$1)');
        });

        it('Range Row', () => {
            const result = lexer.convertRefersToAbsolute('A1:B1,A1:B1,A1:B1,A1:B1', AbsoluteRefType.ROW, AbsoluteRefType.ROW);
            expect(result).toStrictEqual('A$1:B$1,A$1:B$1,A$1:B$1,A$1:B$1');
        });

        it('Complex Formula', () => {
            const result = lexer.convertRefersToAbsolute('=SUM(A1:B10) + LAMBDA(x, y, x*y*x)(A1:B10, A10) + MAX(A1:B10,SUM(A2))', AbsoluteRefType.ALL, AbsoluteRefType.ALL);
            expect(result).toStrictEqual('=SUM($A$1:$B$10) + LAMBDA(x, y, x*y*x)($A$1:$B$10,$A$10) + MAX($A$1:$B$10,SUM($A$2))');
        });
    });
});
