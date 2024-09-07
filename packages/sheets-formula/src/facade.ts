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

import type { ICommandService, IDisposable, Injector } from '@univerjs/core';
import { debounce, FBase, toDisposable } from '@univerjs/core';
import { FFormula, SetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import type { IRegisterFunctionParams } from '@univerjs/sheets-formula';
import { IRegisterFunctionService, RegisterFunctionService } from '@univerjs/sheets-formula';

/**
 * This interface class provides methods to modify the behavior of the operation formula.
 */
export class FacadeSheetsFormula extends FBase {
    protected readonly _injector: Injector;
    protected readonly _commandService: ICommandService;

    /**
     * Initialize the FUniver instance.
     *
     * @private
     */
    override _initialize(): void {
        this._debouncedFormulaCalculation = debounce(() => {
            this._commandService.executeCommand(
                SetFormulaCalculationStartMutation.id,
                {
                    commands: [],
                    forceCalculation: true,
                },
                {
                    onlyLocal: true,
                }
            );
        }, 10);
    }

    /**
     * registerFunction may be executed multiple times, triggering multiple formula forced refreshes
     */
    private _debouncedFormulaCalculation: () => void;

    /**
     * Register a function to the spreadsheet.
     *
     * @param {IRegisterFunctionParams} config The configuration of the function.
     * @returns {IDisposable} The disposable instance.
     */
    registerFunction(config: IRegisterFunctionParams): IDisposable {
        let registerFunctionService = this._injector.get(IRegisterFunctionService);

        if (!registerFunctionService) {
            this._injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
            registerFunctionService = this._injector.get(IRegisterFunctionService);
        }

        const functionsDisposable = registerFunctionService.registerFunctions(config);

        // When the initialization workbook data already contains custom formulas, and then register the formula, you need to trigger a forced calculation to refresh the calculation results
        this._debouncedFormulaCalculation();

        return toDisposable(() => {
            functionsDisposable.dispose();
        });
    }
}

FFormula.extend(FacadeSheetsFormula);
