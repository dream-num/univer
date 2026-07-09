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

import type { IFormulaResult } from '@univerjs/data-validation';
import {
    DataValidationType,
    ICommandService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
} from '@univerjs/core';
import { DataValidatorDropdownType } from '@univerjs/data-validation';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    BASE_FORMULA_INPUT_NAME,
    CHECKBOX_FORMULA_INPUT_NAME,
    CUSTOM_FORMULA_INPUT_NAME,
    DataValidationFormulaService,
    LIST_FORMULA_INPUT_NAME,
    SheetDataValidationModel,
} from '@univerjs/sheets-data-validation';
import { describe, expect, it } from 'vitest';
import { DateShowTimeOption } from '../../components/DateShowTimeOption';
import { ListRenderModeInput } from '../../components/ListRenderModeInput';

class TestPath2D {
    constructor(_path?: string) {
        // Path details are not used by these view choice tests.
    }
}

Object.assign(globalThis, { Path2D: TestPath2D });

class TestCommandService {}

class TestUniverInstanceService {}

class TestRenderManagerService {}

class TestLocaleService {}

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

class TestSheetDataValidationModel {}

function createValidatorViewInjector() {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([SheetDataValidationModel, { useClass: TestSheetDataValidationModel as never }]);
    injector.add([DataValidationFormulaService, { useClass: TestFormulaService as never }]);
    injector.add([ThemeService, { useClass: TestThemeService as never }]);
    return injector;
}

describe('sheet data validation view choices', () => {
    it('uses list editors and dropdown renderers for list validation rules', async () => {
        const { DropdownMultipleWidget } = await import('../../widgets/dropdown-multiple-widget');
        const { DropdownWidget } = await import('../../widgets/dropdown-widget');
        const { ListMultipleValidatorView } = await import('../list-multiple-view');
        const { ListValidatorView } = await import('../list-validator-view');
        const injector = createValidatorViewInjector();

        const singleListView = injector.createInstance(ListValidatorView);
        const multipleListView = injector.createInstance(ListMultipleValidatorView);

        expect(singleListView.id).toBe(DataValidationType.LIST);
        expect(singleListView.formulaInput).toBe(LIST_FORMULA_INPUT_NAME);
        expect(singleListView.optionsInput).toBe(ListRenderModeInput.componentKey);
        expect(singleListView.dropdownType).toBe(DataValidatorDropdownType.LIST);
        expect(singleListView.canvasRender).toBeInstanceOf(DropdownWidget);

        expect(multipleListView.id).toBe(DataValidationType.LIST_MULTIPLE);
        expect(multipleListView.dropdownType).toBe(DataValidatorDropdownType.MULTIPLE_LIST);
        expect(multipleListView.canvasRender).toBeInstanceOf(DropdownMultipleWidget);
    });

    it('uses specialized formula editors for checkbox, custom, date, and numeric validation rules', async () => {
        const { CheckboxRender } = await import('../../widgets/checkbox-widget');
        const { CheckboxValidatorView } = await import('../checkbox-validator-view');
        const { CustomFormulaValidatorView } = await import('../custom-validator-view');
        const { DateValidatorView } = await import('../date-validator-view');
        const { DecimalValidatorView } = await import('../decimal-validator-view');
        const { TextLengthValidatorView } = await import('../text-length-validator.view');
        const { WholeValidatorView } = await import('../whole-validator-view');
        const injector = createValidatorViewInjector();

        const checkboxView = injector.createInstance(CheckboxValidatorView);
        const customView = injector.createInstance(CustomFormulaValidatorView);
        const dateView = injector.createInstance(DateValidatorView);
        const decimalView = injector.createInstance(DecimalValidatorView);
        const textLengthView = injector.createInstance(TextLengthValidatorView);
        const wholeView = injector.createInstance(WholeValidatorView);

        expect(checkboxView.id).toBe(DataValidationType.CHECKBOX);
        expect(checkboxView.formulaInput).toBe(CHECKBOX_FORMULA_INPUT_NAME);
        expect(checkboxView.canvasRender).toBeInstanceOf(CheckboxRender);

        expect(customView.id).toBe(DataValidationType.CUSTOM);
        expect(customView.formulaInput).toBe(CUSTOM_FORMULA_INPUT_NAME);

        expect(dateView.id).toBe(DataValidationType.DATE);
        expect(dateView.formulaInput).toBe(BASE_FORMULA_INPUT_NAME);
        expect(dateView.optionsInput).toBe(DateShowTimeOption.componentKey);
        expect(dateView.dropdownType).toBe(DataValidatorDropdownType.DATE);

        expect(decimalView.formulaInput).toBe(BASE_FORMULA_INPUT_NAME);
        expect(textLengthView.formulaInput).toBe(BASE_FORMULA_INPUT_NAME);
        expect(wholeView.formulaInput).toBe(BASE_FORMULA_INPUT_NAME);
    });
});
