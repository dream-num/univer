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
import {
    DataValidationRenderMode,
    DataValidationType,
    ICommandService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
} from '@univerjs/core';
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
    results: { result: { v: string }[][][][] }[] | undefined;

    getRuleFormulaResult(): Promise<IFormulaResult[] | undefined> {
        return Promise.resolve(this.results as IFormulaResult[] | undefined);
    }

    getRuleFormulaResultSync(): IFormulaResult[] | undefined {
        return this.results as IFormulaResult[] | undefined;
    }
}

class TestCheckboxValidator {
    skipDefaultFontRender(): boolean {
        return true;
    }
}

class TestListValidator {
    id = DataValidationType.LIST;

    skipDefaultFontRender(): boolean {
        return true;
    }

    getListWithColorMap(): Record<string, string> {
        return {
            Done: '#34c759',
            Hold: '#ffcc00',
        };
    }
}

class TestListMultipleValidator extends TestListValidator {
    override id = DataValidationType.LIST_MULTIPLE;

    parseCellValue(value: unknown): string[] {
        return String(value || '').split(',').filter(Boolean);
    }
}

class TestSheetDataValidationModel {
    rule: IDataValidationRule = {
        uid: 'rule-checkbox',
        type: DataValidationType.CHECKBOX,
        ranges: [{ startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 }],
        formula1: 'DONE',
        formula2: 'TODO',
    };

    readonly checkboxValidator = new TestCheckboxValidator();
    readonly listValidator = new TestListValidator();
    readonly listMultipleValidator = new TestListMultipleValidator();

    getRuleByLocation(): IDataValidationRule {
        return this.rule;
    }

    getValidator(type: DataValidationType) {
        if (type === DataValidationType.LIST) {
            return this.listValidator;
        }

        if (type === DataValidationType.LIST_MULTIPLE) {
            return this.listMultipleValidator;
        }

        return this.checkboxValidator;
    }
}

class RecordingRenderContext {
    readonly fillStyles: unknown[] = [];

    private _fillStyle: unknown;

    get fillStyle(): unknown {
        return this._fillStyle;
    }

    set fillStyle(value: unknown) {
        this._fillStyle = value;
        this.fillStyles.push(value);
    }

    save(): void {}
    restore(): void {}
    translateWithPrecision(): void {}
    translate(): void {}
    beginPath(): void {}
    rect(): void {}
    clip(): void {}
    fill(): void {}
    closePath(): void {}
    moveTo(): void {}
    lineTo(): void {}
    arc(): void {}
    fillText(): void {}
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

function getDataValidationModel(injector: Injector): TestSheetDataValidationModel {
    return injector.get(SheetDataValidationModel) as unknown as TestSheetDataValidationModel;
}

function getFormulaService(injector: Injector): TestFormulaService {
    return injector.get(DataValidationFormulaService) as unknown as TestFormulaService;
}

function createSkeleton() {
    return {
        rowHeaderWidth: 8,
        columnHeaderHeight: 12,
    };
}

function getRenderedDropdownInfo(widget: unknown) {
    const map = (widget as { _dropdownInfoMap: Map<string, Map<string, { left: number; top: number; width: number; height: number }>> })._dropdownInfoMap;
    return map.get('sheet-1')!.get('3.4')!;
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

    it('uses the rendered capsule bounds for single-select dropdown hit testing', async () => {
        const injector = createInjector();
        const model = getDataValidationModel(injector);
        model.rule = {
            ...model.rule,
            type: DataValidationType.LIST,
            renderMode: DataValidationRenderMode.CUSTOM,
        };
        const { DropdownWidget } = await import('../dropdown-widget');
        const widget = injector.createInstance(DropdownWidget);
        const ctx = new RecordingRenderContext();
        const cellContext = createCellContext('Done');

        widget.drawWith(ctx as never, cellContext, createSkeleton() as never);
        const dropdownInfo = getRenderedDropdownInfo(widget);

        expect(widget.isHit({ x: dropdownInfo.left + 1, y: dropdownInfo.top + 1 }, cellContext)).toBe(true);
        expect(widget.isHit({ x: dropdownInfo.left - 1, y: dropdownInfo.top + 1 }, cellContext)).toBe(false);
        expect(widget.isHit({ x: dropdownInfo.left + 1, y: dropdownInfo.top - 1 }, cellContext)).toBe(false);
    });

    it('limits arrow-mode single-select hit testing to the dropdown arrow region', async () => {
        const injector = createInjector();
        const model = getDataValidationModel(injector);
        model.rule = {
            ...model.rule,
            type: DataValidationType.LIST,
            renderMode: DataValidationRenderMode.ARROW,
        };
        const { DropdownWidget } = await import('../dropdown-widget');
        const widget = injector.createInstance(DropdownWidget);
        const ctx = new RecordingRenderContext();
        const cellContext = createCellContext('Done');

        widget.drawWith(ctx as never, cellContext, createSkeleton() as never);
        const dropdownInfo = getRenderedDropdownInfo(widget);

        expect(widget.isHit({ x: dropdownInfo.left + 1, y: dropdownInfo.top + 1 }, cellContext)).toBe(true);
        expect(widget.isHit({ x: dropdownInfo.left - 10, y: dropdownInfo.top + 1 }, cellContext)).toBe(false);
    });

    it('applies list option colors while drawing multi-select dropdown capsules', async () => {
        const injector = createInjector();
        const model = getDataValidationModel(injector);
        model.rule = {
            ...model.rule,
            type: DataValidationType.LIST_MULTIPLE,
        };
        const { DropdownMultipleWidget } = await import('../dropdown-multiple-widget');
        const widget = injector.createInstance(DropdownMultipleWidget);
        const ctx = new RecordingRenderContext();

        widget.drawWith(ctx as never, createCellContext('Done,Hold'), createSkeleton() as never, {} as never);

        expect(ctx.fillStyles).toContain('#34c759');
        expect(ctx.fillStyles).toContain('#ffcc00');
    });

    it('calculates autofit dimensions for multi-select list capsules', async () => {
        const injector = createInjector();
        const model = getDataValidationModel(injector);
        model.rule = {
            ...model.rule,
            type: DataValidationType.LIST_MULTIPLE,
        };
        const { DropdownMultipleWidget } = await import('../dropdown-multiple-widget');
        const widget = injector.createInstance(DropdownMultipleWidget);
        const cellContext = createCellContext('Done,Hold,Done,Hold,Done,Hold');

        expect(widget.calcCellAutoHeight(cellContext)).toBe(12);
        expect(widget.calcCellAutoWidth(cellContext)).toBe(94);
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

    it('toggles checkbox cells from the unchecked formula value to the checked formula value', async () => {
        const injector = createInjector();
        const { CheckboxRender } = await import('../checkbox-widget');
        const widget = injector.createInstance(CheckboxRender);

        await widget.onPointerDown(createCellContext('TODO'), { button: 0 } as never);

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
                        v: 'DONE',
                        p: null,
                    },
                } satisfies ISetRangeValuesCommandParams,
            },
        ]);
    });

    it('writes the resolved unchecked value when a checked checkbox rule uses formulas', async () => {
        const injector = createInjector();
        const model = getDataValidationModel(injector);
        model.rule = {
            ...model.rule,
            formula1: '=A1',
            formula2: '=B1',
        };
        getFormulaService(injector).results = [
            { result: [[[[{ v: 'DONE' }]]]] },
            { result: [[[[{ v: 'TODO' }]]]] },
        ];
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

    it('keeps checkbox cell values unchanged on secondary clicks', async () => {
        const injector = createInjector();
        const { CheckboxRender } = await import('../checkbox-widget');
        const widget = injector.createInstance(CheckboxRender);

        await widget.onPointerDown(createCellContext('TODO'), { button: 2 } as never);

        expect(getCommandService(injector).commands).toEqual([]);
    });
});
