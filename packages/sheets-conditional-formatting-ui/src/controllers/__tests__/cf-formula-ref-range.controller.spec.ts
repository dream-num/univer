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
    IResourceLoaderService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import {
    InsertColByRangeCommand,
    InsertColCommand,
    InsertColMutation,
    InsertRowByRangeCommand,
    InsertRowCommand,
    InsertRowMutation,
    MoveRangeCommand,
    MoveRangeMutation,
    RefRangeService,
    RemoveColMutation,
    RemoveRowMutation,
    SetRangeValuesCommand,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import {
    AddCfCommand,
    CFRuleType,
    CFSubRuleType,
    ConditionalFormattingRuleModel,
    ConditionalFormattingService,
    ConditionalFormattingStyleComposer,
} from '@univerjs/sheets-conditional-formatting';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingFormulaRefRangeController } from '../cf-formula-ref-range.controller';

describe('ConditionalFormattingFormulaRefRangeController', () => {
    let testBed: ReturnType<typeof createCfUiTestBed>;

    beforeEach(() => {
        testBed = createCfUiTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            name: 'Rules workbook',
            locale: LocaleType.EN_US,
            sheetOrder: ['sheet1', 'source'],
            sheets: {
                sheet1: { id: 'sheet1', name: 'Rules', cellData: {} },
                source: { id: 'source', name: 'Source', cellData: {} },
            },
            styles: {},
        });
        testBed.injector.add([LexerTreeBuilder]);
        testBed.injector.add([RefRangeService]);
        testBed.injector.add([FormulaRefRangeService]);
        testBed.injector.add([ConditionalFormattingFormulaRefRangeController]);
        const localeService = testBed.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: sheetsEnUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const commandService = testBed.get(ICommandService);
        for (const command of [
            InsertRowCommand,
            InsertColCommand,
            InsertRowByRangeCommand,
            InsertColByRangeCommand,
            InsertRowMutation,
            InsertColMutation,
            RemoveRowMutation,
            RemoveColMutation,
            MoveRangeCommand,
            MoveRangeMutation,
            SetSelectionsOperation,
            SetWorksheetActiveOperation,
            AddCfCommand,
        ]) {
            commandService.registerCommand(command);
        }
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it.each([
        { relative: true },
        { relative: false },
    ].flatMap((reference) => [
        { externalUnit: false, keepOwnerActive: false },
        { externalUnit: false, keepOwnerActive: true },
        { externalUnit: true, keepOwnerActive: false },
        { externalUnit: true, keepOwnerActive: true },
    ].map((target) => ({ ...reference, ...target }))))('updates fixed source dependencies after an explicit move with relative=$relative, externalUnit=$externalUnit and keepOwnerActive=$keepOwnerActive', async ({ relative, externalUnit, keepOwnerActive }) => {
        testBed.get(ConditionalFormattingFormulaRefRangeController);
        const instances = testBed.get(IUniverInstanceService);
        const sourceUnitId = externalUnit ? 'external' : 'test';
        if (externalUnit) {
            testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: sourceUnitId,
                appVersion: '3.0.0-alpha',
                name: 'Source workbook',
                locale: LocaleType.EN_US,
                sheetOrder: ['source'],
                sheets: { source: { id: 'source', name: 'Source', cellData: {} } },
                styles: {},
            });
        }
        instances.focusUnit(keepOwnerActive ? 'test' : sourceUnitId);
        instances.setCurrentUnitForType(keepOwnerActive ? 'test' : sourceUnitId);
        const qualifier = externalUnit ? '[external]Source' : 'Source';
        const commands = testBed.get(ICommandService);
        expect(await commands.executeCommand(SetWorksheetActiveOperation.id, {
            unitId: keepOwnerActive ? 'test' : sourceUnitId,
            subUnitId: keepOwnerActive ? 'sheet1' : 'source',
        })).toBe(true);
        expect(await commands.executeCommand(SetRangeValuesCommand.id, {
            unitId: sourceUnitId,
            subUnitId: 'source',
            range: { startRow: 1, endRow: 1, startColumn: 9, endColumn: 9 },
            value: { v: 11 },
        })).toBe(true);
        const originalRule = {
            cfId: 'fixed-and-relative',
            ranges: [{ startRow: 1, endRow: 2, startColumn: 9, endColumn: 10 }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.formula,
                value: relative ? `=${qualifier}!$J$2+${qualifier}!J2>0` : `=${qualifier}!$J$2>0`,
                style: { bl: 1 },
            },
        };
        expect(await commands.executeCommand(AddCfCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: originalRule,
        })).toBe(true);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: sourceUnitId,
            toUnitId: sourceUnitId,
            fromSubUnitId: 'source',
            toSubUnitId: 'source',
            fromRange: { startRow: 1, endRow: 1, startColumn: 9, endColumn: 9 },
            toRange: { startRow: 4, endRow: 4, startColumn: 12, endColumn: 12 },
        })).toBe(true);
        const model = testBed.get(ConditionalFormattingRuleModel);
        const lexer = testBed.get(LexerTreeBuilder);
        const expected = [
            { row: 1, column: 9, formula: `=${qualifier}!$M$5+${qualifier}!M5>0` },
            { row: 1, column: 10, formula: `=${qualifier}!$M$5+${qualifier}!K2>0` },
            { row: 2, column: 9, formula: `=${qualifier}!$M$5+${qualifier}!J3>0` },
            { row: 2, column: 10, formula: `=${qualifier}!$M$5+${qualifier}!K3>0` },
        ];
        function checkMovedReferences() {
            for (const { row, column, formula } of expected) {
                const matches = (model.getSubunitRules('test', 'sheet1') || []).filter((rule) => rule.ranges.some((range) =>
                    row >= range.startRow && row <= range.endRow
                    && column >= range.startColumn && column <= range.endColumn
                ));
                expect(matches).toHaveLength(1);
                const rule = matches[0];
                if (rule.rule.type !== CFRuleType.highlightCell || rule.rule.subType !== CFSubRuleType.formula) {
                    throw new Error('Expected formula conditional rule');
                }
                expect(lexer.moveFormulaRefOffset(
                    rule.rule.value,
                    column - rule.ranges[0].startColumn,
                    row - rule.ranges[0].startRow
                )).toBe(relative ? formula : `=${qualifier}!$M$5>0`);
            }
        }
        checkMovedReferences();
        instances.focusUnit(sourceUnitId);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        checkMovedReferences();
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: sourceUnitId,
            toUnitId: sourceUnitId,
            fromSubUnitId: 'source',
            toSubUnitId: 'source',
            fromRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            toRange: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 },
        })).toBe(true);
        checkMovedReferences();
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        checkMovedReferences();
    });

    it('partitions fully moved range dependencies from partially overlapping neighboring owners', async () => {
        testBed.get(ConditionalFormattingFormulaRefRangeController);
        const commands = testBed.get(ICommandService);
        expect(await commands.executeCommand(SetRangeValuesCommand.id, {
            unitId: 'test',
            subUnitId: 'source',
            range: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 0 },
            value: { v: 2 },
        })).toBe(true);
        const originalRule = {
            cfId: 'partially-moved-range',
            ranges: [{ startRow: 1, endRow: 3, startColumn: 9, endColumn: 9 }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.formula,
                value: '=SUM(Source!A1:A2)>0',
                style: { bl: 1 },
            },
        };
        expect(await commands.executeCommand(AddCfCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: originalRule,
        })).toBe(true);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: 'test',
            toUnitId: 'test',
            fromSubUnitId: 'source',
            toSubUnitId: 'source',
            fromRange: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 0 },
            toRange: { startRow: 4, endRow: 5, startColumn: 12, endColumn: 12 },
        })).toBe(true);
        const model = testBed.get(ConditionalFormattingRuleModel);
        const lexer = testBed.get(LexerTreeBuilder);
        function checkMovedReferences() {
            for (const [row, formula] of [
                [1, '=SUM(Source!A1:A2)>0'],
                [2, '=SUM(Source!M5:M6)>0'],
                [3, '=SUM(Source!A3:A4)>0'],
            ] as const) {
                const matches = (model.getSubunitRules('test', 'sheet1') || []).filter((rule) => rule.ranges.some((range) =>
                    row >= range.startRow && row <= range.endRow
                    && range.startColumn <= 9 && range.endColumn >= 9
                ));
                expect(matches).toHaveLength(1);
                const rule = matches[0];
                if (rule.rule.type !== CFRuleType.highlightCell || rule.rule.subType !== CFSubRuleType.formula) {
                    throw new Error('Expected formula conditional rule');
                }
                expect(lexer.moveFormulaRefOffset(rule.rule.value, 9 - rule.ranges[0].startColumn, row - rule.ranges[0].startRow)).toBe(formula);
            }
        }
        checkMovedReferences();
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        checkMovedReferences();
    });

    it.each([
        { row: true, initial: 'A1:A2', formulas: ['A1:A3', 'A3:A4', 'A4:A5'] },
        { row: false, initial: 'A1:B1', formulas: ['A1:C1', 'C1:D1', 'D1:E1'] },
    ])('partitions source insertion thresholds across relative owners with row=$row', async ({ row, initial, formulas }) => {
        testBed.get(ConditionalFormattingFormulaRefRangeController);
        const commands = testBed.get(ICommandService);
        const originalRule = {
            cfId: 'insertion-threshold',
            ranges: [{ startRow: 1, endRow: row ? 3 : 1, startColumn: 9, endColumn: row ? 9 : 11 }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.formula,
                value: `=SUM(Source!${initial})>0`,
                style: { bl: 1 },
            },
        };
        expect(await commands.executeCommand(AddCfCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: originalRule,
        })).toBe(true);
        const source = testBed.get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('source')!;
        expect(await commands.executeCommand(row ? InsertRowCommand.id : InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'source',
            range: row
                ? { startRow: 1, endRow: 1, startColumn: 0, endColumn: source.getColumnCount() - 1 }
                : { startRow: 0, endRow: source.getRowCount() - 1, startColumn: 1, endColumn: 1 },
            direction: row ? Direction.UP : Direction.LEFT,
        })).toBe(true);
        const model = testBed.get(ConditionalFormattingRuleModel);
        const lexer = testBed.get(LexerTreeBuilder);
        function checkReferences() {
            for (const [offset, formula] of formulas.entries()) {
                const ownerRow = row ? 1 + offset : 1;
                const ownerColumn = row ? 9 : 9 + offset;
                const matches = (model.getSubunitRules('test', 'sheet1') || []).filter((rule) => rule.ranges.some((range) =>
                    ownerRow >= range.startRow && ownerRow <= range.endRow
                    && ownerColumn >= range.startColumn && ownerColumn <= range.endColumn
                ));
                expect(matches).toHaveLength(1);
                const rule = matches[0];
                if (rule.rule.type !== CFRuleType.highlightCell || rule.rule.subType !== CFSubRuleType.formula) {
                    throw new Error('Expected formula conditional rule');
                }
                expect(lexer.moveFormulaRefOffset(rule.rule.value, ownerColumn - rule.ranges[0].startColumn, ownerRow - rule.ranges[0].startRow)).toBe(`=SUM(Source!${formula})>0`);
            }
        }
        checkReferences();
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        checkReferences();
    });

    it('preserves fixed source references through resource save, disposal and reopen', async () => {
        testBed.injector.add([ConditionalFormattingStyleComposer]);
        testBed.injector.add([ConditionalFormattingService]);
        testBed.get(ConditionalFormattingService);
        testBed.get(ConditionalFormattingFormulaRefRangeController);
        const commands = testBed.get(ICommandService);
        const originalRule = {
            cfId: 'persisted-absolute',
            ranges: [{ startRow: 1, endRow: 2, startColumn: 9, endColumn: 10 }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.formula,
                value: '=Source!$J$2>0',
                style: { bl: 1 },
            },
        };
        expect(await commands.executeCommand(AddCfCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: originalRule,
        })).toBe(true);
        const snapshot = testBed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test')!;
        expect(snapshot.resources.some((resource) => resource.data.includes('persisted-absolute'))).toBe(true);
        testBed.get(IUniverInstanceService).disposeUnit('test');
        testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
        testBed.get(IUniverInstanceService).focusUnit('test');
        const model = testBed.get(ConditionalFormattingRuleModel);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
        const source = testBed.get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('source')!;
        expect(await commands.executeCommand(InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'source',
            range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: source.getColumnCount() - 1 },
            direction: Direction.UP,
        })).toBe(true);
        const updatedRule = { ...originalRule, rule: { ...originalRule.rule, value: '=Source!$J$3>0' } };
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([updatedRule]);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([updatedRule]);
    });

    it.each([
        { row: true, initial: 'J2:J$100', expected: 'J2:J$101' },
        { row: false, initial: 'J2:$Z3', expected: 'J2:$AA3' },
    ])('updates the far mixed endpoint of a range dependency with row=$row', async ({ row, initial, expected }) => {
        testBed.get(ConditionalFormattingFormulaRefRangeController);
        const commands = testBed.get(ICommandService);
        const originalRule = {
            cfId: 'mixed-endpoint',
            ranges: [{ startRow: 1, endRow: 1, startColumn: 9, endColumn: 9 }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.formula,
                value: `=SUM(Source!${initial})>0`,
                style: { bl: 1 },
            },
        };
        expect(await commands.executeCommand(AddCfCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: originalRule,
        })).toBe(true);
        const source = testBed.get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('source')!;
        expect(await commands.executeCommand(row ? InsertRowCommand.id : InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'source',
            range: row
                ? { startRow: 50, endRow: 50, startColumn: 0, endColumn: source.getColumnCount() - 1 }
                : { startRow: 0, endRow: source.getRowCount() - 1, startColumn: 15, endColumn: 15 },
            direction: row ? Direction.UP : Direction.LEFT,
        })).toBe(true);
        const model = testBed.get(ConditionalFormattingRuleModel);
        const updatedRule = { ...originalRule, rule: { ...originalRule.rule, value: `=SUM(Source!${expected})>0` } };
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([updatedRule]);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([updatedRule]);
    });

    for (const { label, initial, afterRow, afterColumn } of [
        { label: 'relative', initial: 'J2', afterRow: 'J3', afterColumn: 'K2' },
        { label: 'absolute', initial: '$J$2', afterRow: '$J$3', afterColumn: '$K$2' },
        { label: 'row-absolute', initial: 'J$2', afterRow: 'J$3', afterColumn: 'K$2' },
        { label: 'column-absolute', initial: '$J2', afterRow: '$J3', afterColumn: '$K2' },
    ]) {
        it.each([
            { name: 'other sheet row', row: true, externalUnit: false, keepOwnerActive: false },
            { name: 'other sheet column', row: false, externalUnit: false, keepOwnerActive: false },
            { name: 'other workbook row', row: true, externalUnit: true, keepOwnerActive: false },
            { name: 'other workbook column', row: false, externalUnit: true, keepOwnerActive: false },
            { name: 'inactive source sheet row', row: true, externalUnit: false, keepOwnerActive: true },
            { name: 'inactive source sheet column', row: false, externalUnit: false, keepOwnerActive: true },
            { name: 'inactive source workbook row', row: true, externalUnit: true, keepOwnerActive: true },
            { name: 'inactive source workbook column', row: false, externalUnit: true, keepOwnerActive: true },
        ])(`preserves ${label} references and rule owner coordinates when inserting in $name through undo and redo`, async ({ row, externalUnit, keepOwnerActive }) => {
            testBed.get(ConditionalFormattingFormulaRefRangeController);
            const instances = testBed.get(IUniverInstanceService);
            const sourceUnitId = externalUnit ? 'external' : 'test';
            if (externalUnit) {
                testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: sourceUnitId,
                    appVersion: '3.0.0-alpha',
                    name: 'Source workbook',
                    locale: LocaleType.EN_US,
                    sheetOrder: ['source'],
                    sheets: { source: { id: 'source', name: 'Source', cellData: {} } },
                    styles: {},
                });
            }
            instances.focusUnit(keepOwnerActive ? 'test' : sourceUnitId);
            instances.setCurrentUnitForType(keepOwnerActive ? 'test' : sourceUnitId);
            const commandService = testBed.get(ICommandService);
            expect(await commandService.executeCommand(SetWorksheetActiveOperation.id, {
                unitId: keepOwnerActive ? 'test' : sourceUnitId,
                subUnitId: keepOwnerActive ? 'sheet1' : 'source',
            })).toBe(true);
            const currentWorkbook = instances.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            expect(currentWorkbook.getUnitId()).toBe(keepOwnerActive ? 'test' : sourceUnitId);
            expect(currentWorkbook.getActiveSheet().getSheetId()).toBe(keepOwnerActive ? 'sheet1' : 'source');
            const qualifier = externalUnit ? '[external]Source' : 'Source';
            const originalRule = {
                cfId: 'source-dependent',
                ranges: [{ startRow: 1, endRow: 2, startColumn: 9, endColumn: 10 }],
                stopIfTrue: false,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.formula,
                    value: `=${qualifier}!${initial}>0`,
                    style: { bl: 1 },
                },
            };
            expect(await commandService.executeCommand(AddCfCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                rule: originalRule,
            })).toBe(true);
            const sourceSheet = instances.getUnit<Workbook>(sourceUnitId, UniverInstanceType.UNIVER_SHEET)!.getSheetBySheetId('source')!;
            expect(await commandService.executeCommand(row ? InsertRowCommand.id : InsertColCommand.id, {
                unitId: sourceUnitId,
                subUnitId: 'source',
                range: row
                    ? { startRow: 1, endRow: 1, startColumn: 0, endColumn: sourceSheet.getColumnCount() - 1 }
                    : { startRow: 0, endRow: sourceSheet.getRowCount() - 1, startColumn: 9, endColumn: 9 },
                direction: row ? Direction.UP : Direction.LEFT,
            })).toBe(true);
            const updatedRule = {
                ...originalRule,
                rule: { ...originalRule.rule, value: `=${qualifier}!${row ? afterRow : afterColumn}>0` },
            };
            const model = testBed.get(ConditionalFormattingRuleModel);
            expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([updatedRule]);
            instances.focusUnit(sourceUnitId);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([updatedRule]);
        });
    }
    for (const { label, formula } of [
        { label: 'relative', formula: '=J2>0' },
        { label: 'mixed', formula: '=J$2+$J2+$J$2' },
        { label: 'absolute', formula: '=$J$2>0' },
    ]) {
        it.each([
            { name: 'row before', command: InsertRowCommand, direction: Direction.UP, row: true },
            { name: 'row after', command: InsertRowCommand, direction: Direction.DOWN, row: true },
            { name: 'column before', command: InsertColCommand, direction: Direction.LEFT, row: false },
            { name: 'column after', command: InsertColCommand, direction: Direction.RIGHT, row: false },
        ])(`anchors ${label} references to the expanded range for $name through undo and redo`, async ({ command, direction, row }) => {
            testBed.get(ConditionalFormattingFormulaRefRangeController);
            const commandService = testBed.get(ICommandService);
            const model = testBed.get(ConditionalFormattingRuleModel);
            const originalRange = { startRow: 1, endRow: 2, startColumn: 9, endColumn: 10 };
            const originalRule = {
                cfId: 'positive-records',
                stopIfTrue: false,
                ranges: [originalRange],
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.formula,
                    value: formula,
                    style: { bl: 1 },
                },
            };
            expect(await commandService.executeCommand(AddCfCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                rule: originalRule,
            })).toBe(true);
            const worksheet = testBed.get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
            const insertionRange = row
                ? { startRow: 2, endRow: 2, startColumn: 0, endColumn: worksheet.getColumnCount() - 1 }
                : { startRow: 0, endRow: worksheet.getRowCount() - 1, startColumn: 10, endColumn: 10 };
            expect(await commandService.executeCommand(command.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: insertionRange,
                direction,
            })).toBe(true);
            const expandedRange = {
                ...originalRange,
                endRow: row ? 3 : 2,
                endColumn: row ? 10 : 11,
            };
            expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([
                { ...originalRule, ranges: [expandedRange] },
            ]);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([originalRule]);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(model.getSubunitRules('test', 'sheet1')).toMatchObject([
                { ...originalRule, ranges: [expandedRange] },
            ]);
        });
    }
});
