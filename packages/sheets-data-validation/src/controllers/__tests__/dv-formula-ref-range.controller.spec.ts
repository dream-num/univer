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

import { DataValidationType, ICommandService, IUniverInstanceService, LocaleService, LocaleType, RedoCommand, Tools, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { AddDataValidationMutation } from '@univerjs/data-validation';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { RemoveRowCommand } from '@univerjs/sheets';
import { expect, it } from 'vitest';
import { SheetDataValidationModel } from '../../models/sheet-data-validation-model';
import { UniverSheetsDataValidationPlugin } from '../../plugin';

it('deletes referenced rows when a relative validation formula splits and restores the rules on undo', async () => {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} } });
    try {
        univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: true });
        univer.registerPlugin(UniverSheetsDataValidationPlugin);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'test',
            name: 'Validation',
            sheetOrder: ['source'],
            sheets: {
                source: { id: 'source', name: 'Source', rowCount: 20, columnCount: 10 },
            },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit('test');
        const locale = injector.get(LocaleService);
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetDataValidationModel);
        expect(commands.syncExecuteCommand(AddDataValidationMutation.id, {
            unitId: 'test',
            subUnitId: 'source',
            rule: {
                uid: 'relative',
                type: DataValidationType.CUSTOM,
                formula1: '=B3>0',
                ranges: [{ startRow: 0, endRow: 9, startColumn: 0, endColumn: 0 }],
            },
        })).toBe(true);
        const read = () => Tools.deepClone(model.getRules('test', 'source'));
        const before = read();
        expect(await commands.executeCommand(RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: 'source',
            range: { startRow: 4, endRow: 4, startColumn: 0, endColumn: 9 },
        })).toBe(true);
        const after = read();
        expect(after.length).toBeGreaterThan(1);
        expect(after.some((rule) => rule.formula1?.includes('#REF!'))).toBe(true);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(read()).toEqual(before);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(read()).toEqual(after);
    } finally {
        univer.dispose();
    }
});
