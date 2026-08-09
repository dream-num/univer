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

import type { IFormulaData, IUnitSheetNameMap } from '@univerjs/engine-formula';
import { Direction, ICommandService, IUndoRedoService, LocaleType, RedoCommand, UndoCommand } from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder, SetArrayFormulaDataMutation, SetFormulaDataMutation } from '@univerjs/engine-formula';
import { InsertRowByRangeCommand, InsertRowCommand, InsertRowMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { UpdateFormulaController } from '@univerjs/sheets-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from './create-command-test-bed';

describe('formula reference index', () => {
    let commandService: ICommandService;
    let controller: UpdateFormulaController;
    let lexerTreeBuilder: LexerTreeBuilder;
    let formulaDataModel: FormulaDataModel;
    let dispose: () => void;

    beforeEach(() => {
        const testBed = createCommandTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: '',
            sheetOrder: ['target', 'formula'],
            styles: {},
            sheets: {
                target: {
                    id: 'target',
                    name: 'Target',
                    rowCount: 30,
                    columnCount: 8,
                    cellData: {},
                },
                formula: {
                    id: 'formula',
                    name: 'Formula',
                    rowCount: 10,
                    columnCount: 2,
                    cellData: {
                        0: { 0: { f: '=Target!A10' } },
                        1: { 0: { f: '=Target!A10' } },
                        2: { 0: { f: '=Target!A1' } },
                        3: { 0: { f: '=OFFSET(Target!A1,9,0)' } },
                    },
                },
            },
        }, [[UpdateFormulaController]]);

        commandService = testBed.get(ICommandService);
        testBed.get(IUndoRedoService);
        controller = testBed.get(UpdateFormulaController);
        lexerTreeBuilder = testBed.get(LexerTreeBuilder);
        formulaDataModel = testBed.get(FormulaDataModel);
        dispose = () => testBed.univer.dispose();

        commandService.registerCommand(InsertRowCommand);
        commandService.registerCommand(InsertRowByRangeCommand);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);
    });

    afterEach(() => dispose());

    it('rewrites only affected and conservative formulas without reparsing warmed formulas', async () => {
        const indexedFormulaInputs: IFormulaData[] = [];
        const privateController = controller as unknown as {
            _getFormulaReferenceMoveInfo: (
                formulaData: IFormulaData,
                unitSheetNameMap: IUnitSheetNameMap,
                formulaReferenceMoveParam: unknown
            ) => { newFormulaData: IFormulaData };
        };
        const originalMove = privateController._getFormulaReferenceMoveInfo.bind(privateController);
        privateController._getFormulaReferenceMoveInfo = (formulaData, unitSheetNameMap, formulaReferenceMoveParam) => {
            indexedFormulaInputs.push(formulaData);
            return originalMove(formulaData, unitSheetNameMap, formulaReferenceMoveParam);
        };

        const originalBuilder = lexerTreeBuilder.sequenceNodesBuilder.bind(lexerTreeBuilder);
        let commandPathParseCount = 0;
        lexerTreeBuilder.sequenceNodesBuilder = (formulaString) => {
            commandPathParseCount++;
            return originalBuilder(formulaString);
        };

        try {
            await commandService.executeCommand(InsertRowCommand.id, {
                unitId: 'test',
                subUnitId: 'target',
                range: { startRow: 4, endRow: 4, startColumn: 0, endColumn: 7 },
                direction: Direction.UP,
            });

            expect(commandPathParseCount).toBe(0);
            const indexedFormulaData = indexedFormulaInputs[0].test?.formula ?? {};
            const indexedFormulas = Object.values(indexedFormulaData)
                .flatMap((row) => Object.values(row ?? {}))
                .map((item) => (item as { f?: string } | null)?.f);
            expect(indexedFormulas).toEqual([
                '=Target!A10',
                '=Target!A10',
                '=OFFSET(Target!A1,9,0)',
            ]);

            const formulaSheet = testBedSheetFormulaData(formulaDataModel);
            expect(formulaSheet[0]?.[0]?.f).toBe('=Target!A11');
            expect(formulaSheet[1]?.[0]?.f).toBe('=Target!A11');
            expect(formulaSheet[2]?.[0]?.f).toBe('=Target!A1');
            expect(formulaSheet[3]?.[0]?.f).toBe('=OFFSET(Target!A1,9,0)');

            await commandService.executeCommand(UndoCommand.id);
            await commandService.executeCommand(RedoCommand.id);
            expect(commandPathParseCount).toBe(0);
            expect(testBedSheetFormulaData(formulaDataModel)[0]?.[0]?.f).toBe('=Target!A11');
        } finally {
            lexerTreeBuilder.sequenceNodesBuilder = originalBuilder;
        }
    });

    it('refreshes the index after a formula-data mutation', async () => {
        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'formula',
            cellValue: { 2: { 0: { f: '=Target!A10' } } },
        });

        await commandService.executeCommand(InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'target',
            range: { startRow: 4, endRow: 4, startColumn: 0, endColumn: 7 },
            direction: Direction.UP,
        });

        expect(testBedSheetFormulaData(formulaDataModel)[2]?.[0]?.f).toBe('=Target!A11');
    });
});

function testBedSheetFormulaData(formulaDataModel: FormulaDataModel) {
    return formulaDataModel.getFormulaData().test?.formula ?? {};
}
