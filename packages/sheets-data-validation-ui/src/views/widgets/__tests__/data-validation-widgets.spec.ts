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

import type { ICellRenderContext, IDataValidationRule } from '@univerjs/core';
import type { IFormulaResult } from '@univerjs/data-validation';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { DataValidationType, ICommandService, Injector, IUniverInstanceService, LocaleService, ThemeService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import { DataValidationFormulaService, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { describe, expect, it } from 'vitest';
import { ShowDataValidationDropdown } from '../../../commands/operations/data-validation.operation';

class TestPath2D {
    constructor(_path?: string) {
        // Path details are not used by these pointer behavior tests.
    }
}

Object.assign(globalThis, { Path2D: TestPath2D });

interface IExecutedCommand {
    id: string;
    params?: unknown;
}

class RecordingCommandService {
    readonly commands: IExecutedCommand[] = [];

    executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.commands.push({ id, params });
        return Promise.resolve(true);
    }
}

class TestUniverInstanceService {
}

class TestRenderManagerService {
}

class TestLocaleService {
}

class TestThemeService {
    getColorFromTheme(): string {
        return '#155eef';
    }
}

class TestFormulaService {
    getRuleFormulaResult(): Promise<IFormulaResult[] | undefined> {
        return Promise.resolve(undefined);
    }

    getRuleFormulaResultSync(): IFormulaResult[] | undefined {
        return undefined;
    }
}

class TestCheckboxValidator {
    skipDefaultFontRender(): boolean {
        return true;
    }
}

class TestSheetDataValidationModel {
    readonly rule: IDataValidationRule = {
        uid: 'rule-checkbox',
        type: DataValidationType.CHECKBOX,
        ranges: [{ startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 }],
        formula1: 'DONE',
        formula2: 'TODO',
    };

    readonly validator = new TestCheckboxValidator();

    getRuleByLocation(): IDataValidationRule {
        return this.rule;
    }

    getValidator(): TestCheckboxValidator {
        return this.validator;
    }
}

function createInjector(): Injector {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: RecordingCommandService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([SheetDataValidationModel, { useClass: TestSheetDataValidationModel as never }]);
    injector.add([DataValidationFormulaService, { useClass: TestFormulaService as never }]);
    injector.add([ThemeService, { useClass: TestThemeService as never }]);
    return injector;
}

function createCellContext(value = 'DONE'): ICellRenderContext {
    return {
        data: { v: value },
        style: null,
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        row: 3,
        col: 4,
        primaryWithCoord: {
            startX: 20,
            startY: 30,
            endX: 140,
            endY: 70,
            actualRow: 8,
            actualColumn: 9,
            isMerged: false,
            isMergedMainCell: false,
            mergeInfo: {
                startX: 20,
                startY: 30,
                endX: 140,
                endY: 70,
                startRow: 3,
                endRow: 3,
                startColumn: 4,
                endColumn: 4,
            },
        },
        worksheet: {
            getCellRaw: () => ({ v: value }),
        },
    } as unknown as ICellRenderContext;
}

function getCommandService(injector: Injector): RecordingCommandService {
    return injector.get(ICommandService) as unknown as RecordingCommandService;
}

describe('data validation canvas widgets', () => {
    it('opens the single-select dropdown for the clicked cell and ignores secondary clicks', async () => {
        const injector = createInjector();
        const { DropdownWidget } = await import('../dropdown-widget');
        const widget = injector.createInstance(DropdownWidget);
        const cellContext = createCellContext();
        const commandService = getCommandService(injector);

        widget.onPointerDown(cellContext, { button: 0 } as never);
        widget.onPointerDown(cellContext, { button: 2 } as never);

        expect(commandService.commands).toEqual([
            {
                id: ShowDataValidationDropdown.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    row: 3,
                    column: 4,
                },
            },
        ]);
    });

    it('limits multi-select dropdown hit testing to the arrow affordance before opening it', async () => {
        const injector = createInjector();
        const { DropdownMultipleWidget } = await import('../dropdown-multiple-widget');
        const widget = injector.createInstance(DropdownMultipleWidget);
        const cellContext = createCellContext();

        expect(widget.isHit({ x: 132, y: 45 }, cellContext)).toBe(true);
        expect(widget.isHit({ x: 120, y: 45 }, cellContext)).toBe(false);

        widget.onPointerDown(cellContext, { button: 0 } as never);

        expect(getCommandService(injector).commands).toEqual([
            {
                id: ShowDataValidationDropdown.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    row: 3,
                    column: 4,
                },
            },
        ]);
    });

    it('toggles checkbox cells from the checked formula value to the unchecked formula value', async () => {
        const injector = createInjector();
        const { CheckboxRender } = await import('../checkbox-widget');
        const widget = injector.createInstance(CheckboxRender);

        await widget.onPointerDown(createCellContext('DONE'), { button: 0 } as never);

        expect(getCommandService(injector).commands).toEqual([
            {
                id: SetRangeValuesCommand.id,
                params: {
                    range: {
                        startColumn: 9,
                        endColumn: 9,
                        startRow: 8,
                        endRow: 8,
                    },
                    value: {
                        v: 'TODO',
                        p: null,
                    },
                } satisfies ISetRangeValuesCommandParams,
            },
        ]);
    });
});
