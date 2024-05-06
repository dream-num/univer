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

import type { ILocales } from '@univerjs/core';
import { Disposable, LocaleService, toDisposable } from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FunctionType, IFunctionService } from '@univerjs/engine-formula';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';

import { IDescriptionService } from './description.service';
import type { IRegisterFunctionList } from './formula-custom-function.service';
import { IFormulaCustomFunctionService } from './formula-custom-function.service';

/**
 * Register function operation params
 */
export interface IRegisterFunctionParams {
    /**
     * i18n
     */
    locales?: ILocales;

    /**
     * function description
     */
    description?: IFunctionInfo[];

    /**
     * function calculation
     */
    calculate: IRegisterFunctionList;
}

/**
 * Unregister function operation params
 */
export interface IUnregisterFunctionParams {
    /**
     * Remove i18n
     */
    localeKeys?: string[];

    /**
     * Function name
     */
    functionNames: string[];
}

export interface IRegisterFunctionService {
    /**
     * register descriptions
     * @param functionList
     */
    registerFunctions(params: IRegisterFunctionParams): IDisposable;
}

export const IRegisterFunctionService = createIdentifier<IRegisterFunctionService>(
    'formula-ui.register-function-service'
);

export class RegisterFunctionService extends Disposable implements IRegisterFunctionService {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(IDescriptionService) private readonly _descriptionService: IDescriptionService,
        @Inject(IFormulaCustomFunctionService)
        private readonly _formulaCustomFunctionService: IFormulaCustomFunctionService,
        @IFunctionService private readonly _functionService: IFunctionService
    ) {
        super();
    }

    registerFunctions(params: IRegisterFunctionParams): IDisposable {
        const { locales, description, calculate } = params;

        // i18n
        if (locales) {
            // dispose is not supported yet
            this._localeService.load(locales);
        }

        let descriptionDisposable: IDisposable;
        // description
        if (description) {
            descriptionDisposable = this._descriptionService.registerDescriptions(description);
        } else {
            const descriptionList: IFunctionInfo[] = calculate.map(([func, functionName, functionIntroduction]) => {
                return {
                    functionName,
                    functionType: FunctionType.User,
                    description: '',
                    abstract: functionIntroduction || '',
                    functionParameter: [],
                };
            });

            descriptionDisposable = this._functionService.registerDescriptions(...descriptionList);
        }

        // calculation
        const functionsDisposable = this._formulaCustomFunctionService.registerFunctions(calculate);

        return toDisposable(() => {
            functionsDisposable.dispose();
            descriptionDisposable.dispose();
        });
    }
}
