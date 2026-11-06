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

import { LocaleType } from '@univerjs/core';
import { expect, it } from 'vitest';
import type { LexerNode } from '../../analysis/lexer-node';
import type { BaseAstNode } from '../../ast-node/base-ast-node';
import { CustomFunction } from '../../../functions/custom-function';
import { Sheet } from '../../../functions/information/sheet';
import { Rows } from '../../../functions/lookup/rows';
import { Sum } from '../../../functions/math/sum';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { createCommandTestBed } from '../../analysis/__tests__/create-command-test-bed';
import { Lexer } from '../../analysis/lexer';
import { AstTreeBuilder } from '../../analysis/parser';
import { ReferenceContext } from '../reference-context';

it('selects order and size sensitive references while retaining ordinary formula caches', () => {
    const sheets = Object.fromEntries(['Main', 'Start', 'End', 'Middle'].map((name) => [name, {
        id: name,
        name,
        rowCount: 4,
        columnCount: 4,
    }]));
    const bed = createCommandTestBed({ id: 'test', name: 'test', appVersion: '1.3.1', locale: LocaleType.EN_US, styles: {}, sheetOrder: ['Main', 'Start', 'End', 'Middle'], sheets });
    try {
        bed.get(IFunctionService).registerExecutors(new Sum('SUM'), new Sheet('SHEET'), new Rows('ROWS'));
        const custom = new CustomFunction('CUSTOMSHEETS');
        custom.needsSheetsInfo = true;
        const customSize = new CustomFunction('CUSTOMSIZE');
        customSize.needsSheetRowColumnCount = true;
        bed.get(IFunctionService).registerExecutors(custom, customSize);
        const config = bed.get(IFormulaCurrentConfigService);
        config.load({ formulaData: {}, arrayFormulaCellData: {}, arrayFormulaRange: {}, forceCalculate: false, dirtyRanges: [], dirtyNameMap: {}, dirtyDefinedNameMap: {}, dirtyUnitFeatureMap: {}, dirtyUnitOtherFormulaMap: {}, allUnitData: { test: bed.sheetData } });
        bed.get(IFormulaRuntimeService).setCurrent(0, 0, 4, 4, 'Main', 'test');
        const context = new ReferenceContext();
        let order = ['Main', 'Start', 'End', 'Middle'];
        const info = (unitId: string) => ({ ...config.getSheetsInfo(unitId), sheetOrder: order });
        const affected = (formula: string) => {
            const node = bed.get(AstTreeBuilder).parse(bed.get(Lexer).treeBuilder(formula) as LexerNode) as BaseAstNode;
            return context.isAffected(node, 'test', 'Main');
        };
        expect(context.update({ test: bed.sheetData }, info)).toBe(false);
        context.finish(true);
        order = ['Main', 'Start', 'Middle', 'End'];
        expect(context.update({ test: bed.sheetData }, info)).toBe(true);
        expect(affected('=SUM(Start:End!A1)')).toBe(true);
        expect(affected('=SHEET("Start")')).toBe(true);
        expect(affected('=CUSTOMSHEETS()')).toBe(true);
        expect(affected('=CUSTOMSIZE()')).toBe(false);
        expect(affected('=SUM(Start!A1:A3)')).toBe(false);
        expect(affected('=SUM("Start:End!A1")')).toBe(false);
        expect(affected('=A1')).toBe(false);
        context.finish(false);
        expect(context.update({ test: bed.sheetData }, info)).toBe(true);
        expect(affected('=SUM(Start:End!A1)')).toBe(true);
        context.finish(true);
        bed.sheetData.Start.rowCount = 6;
        bed.sheetData.Start.columnCount = 6;
        expect(context.update({ test: bed.sheetData }, info)).toBe(true);
        expect(affected('=SUM(Start!A:A)')).toBe(true);
        expect(affected('=ROWS(Start!A:A)')).toBe(true);
        expect(affected('=SUM(Start!1:1)')).toBe(true);
        expect(affected('=SUM(Start!A1:A6)')).toBe(true);
        expect(affected('=SUM(Start!A1:A3)')).toBe(false);
        expect(affected('=SUM(Start:End!A1)')).toBe(false);
        expect(context.update({ test: bed.sheetData }, info)).toBe(false);
        expect(affected('=SUM(Start!A:A)')).toBe(false);
        bed.sheetData.Main.rowCount = 6;
        expect(context.update({ test: bed.sheetData }, info)).toBe(true);
        expect(affected('=CUSTOMSIZE()')).toBe(true);
    } finally { bed.univer.dispose(); }
});
