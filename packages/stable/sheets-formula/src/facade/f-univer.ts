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

import type { IDisposable } from '@univerjs/core';
import type { IRegisterFunctionParams } from '@univerjs/sheets-formula';
import { debounce } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { IRegisterFunctionService, RegisterFunctionService } from '@univerjs/sheets-formula';

/**
 * @ignore
 */
export interface IFUniverSheetsFormulaMixin {
    /**
     * Register a function to the spreadsheet.
     * @deprecated Use `univerAPI.getFormula().registerFunction` instead.
     * @param {IRegisterFunctionParams} config The configuration of the function.
     * @returns {IDisposable} The disposable instance.
     */
    registerFunction(config: IRegisterFunctionParams): IDisposable;
}

/**
 * @ignore
 */
export class FUniverSheetsFormulaMixin extends FUniver implements IFUniverSheetsFormulaMixin {
    /**
     * RegisterFunction may be executed multiple times, triggering multiple formula forced refreshes.
     */
    declare private _debouncedFormulaCalculation: () => void;

    /**
     * Initialize the FUniver instance.
     * @ignore
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

    override registerFunction(config: IRegisterFunctionParams): IDisposable {
        let registerFunctionService = this._injector.get(IRegisterFunctionService);

        if (!registerFunctionService) {
            this._injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
            registerFunctionService = this._injector.get(IRegisterFunctionService);
        }

        const functionsDisposable = registerFunctionService.registerFunctions(config);

        // When the initialization workbook data already contains custom formulas, and then register the formula, you need to trigger a forced calculation to refresh the calculation results
        // TODO@Dushusir: this should be moved to the services not API.
        this._debouncedFormulaCalculation();
        return functionsDisposable;
    }
}

FUniver.extend(FUniverSheetsFormulaMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsFormulaMixin {}
}
