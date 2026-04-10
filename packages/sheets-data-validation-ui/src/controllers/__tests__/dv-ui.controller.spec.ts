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

import type { Injector } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DATA_VALIDATION_PANEL } from '../../commands/operations/data-validation.operation';
import {
    BASE_FORMULA_INPUT_NAME,
    CHECKBOX_FORMULA_INPUT_NAME,
    CUSTOM_FORMULA_INPUT_NAME,
    LIST_FORMULA_INPUT_NAME,
} from '../../views/components/formula-input';
import { SheetsDataValidationUIController } from '../dv-ui.controller';

vi.hoisted(() => {
    Object.assign(globalThis, {
        Path2D: class Path2D {},
    });
});

const FORMULA_INPUT_KEYS = [
    CUSTOM_FORMULA_INPUT_NAME,
    BASE_FORMULA_INPUT_NAME,
    LIST_FORMULA_INPUT_NAME,
    CHECKBOX_FORMULA_INPUT_NAME,
];

function createView(id: string) {
    return {
        id,
        formulaInput: `${id}-formula`,
        canvasRender: `${id}-canvas`,
        dropdownType: `${id}-dropdown`,
        optionsInput: `${id}-options`,
    };
}

describe('SheetsDataValidationUIController', () => {
    it('registers panel components and wires validator views into the registry', () => {
        const register = vi.fn((_key: string) => ({ dispose: vi.fn() }));
        const validators = new Map<string, Record<string, unknown>>();
        const createInstance = vi.fn((viewCtor: { name: string }) => createView(viewCtor.name));
        const getValidatorItem = vi.fn((id: string) => {
            if (!validators.has(id)) {
                validators.set(id, {});
            }
            return validators.get(id);
        });

        const controller = new SheetsDataValidationUIController(
            { createInstance } as unknown as Injector,
            { register } as never,
            { getValidatorItem } as never
        );

        expect(controller).toBeTruthy();

        const registeredKeys = register.mock.calls.map((args) => args[0]);
        expect(registeredKeys).toContain('DataValidationIcon');
        expect(registeredKeys).toContain(DATA_VALIDATION_PANEL);
        expect(registeredKeys).toContain('LIST_RENDER_MODE_OPTION_INPUT');
        expect(registeredKeys).toContain('DATE_SHOW_TIME_OPTION');
        FORMULA_INPUT_KEYS.forEach((key) => expect(registeredKeys).toContain(key));

        ['DecimalValidatorView', 'WholeValidatorView', 'TextLengthValidatorView', 'DateValidatorView', 'CheckboxValidatorView', 'ListValidatorView', 'ListMultipleValidatorView', 'CustomFormulaValidatorView'].forEach((viewName) => {
            expect(createInstance).toHaveBeenCalledWith(expect.objectContaining({ name: viewName }));
            expect(validators.get(viewName)).toEqual({
                formulaInput: `${viewName}-formula`,
                canvasRender: `${viewName}-canvas`,
                dropdownType: `${viewName}-dropdown`,
                optionsInput: `${viewName}-options`,
            });
        });
    });
});
