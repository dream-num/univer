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

import type { ICommand, ILocales } from '@univerjs/core';
import { CommandType, LocaleService } from '@univerjs/core';
import { FunctionType, type IFunctionInfo, IFunctionService } from '@univerjs/engine-formula';
import type { IAccessor } from '@wendellhu/redi';

import { IDescriptionService } from '../../services/description.service';
import type { IRegisterFunctionList } from '../../services/formula-algorithm.service';
import { IFormulaAlgorithmService } from '../../services/formula-algorithm.service';

export interface IRegisterFunctionOperationParams {
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

export const RegisterFunctionOperation: ICommand = {
    id: 'formula-ui.operation.register-function',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params: IRegisterFunctionOperationParams) => {
        const { locales, description, calculate } = params;
        const localeService = accessor.get(LocaleService);
        const descriptionService = accessor.get(IDescriptionService);
        const formulaAlgorithmService = accessor.get(IFormulaAlgorithmService);
        const functionService = accessor.get(IFunctionService);

        // i18n
        if (locales) {
            localeService.load(locales);
        }

        // description
        if (description) {
            descriptionService.registerDescription(description);
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

            functionService.registerDescriptions(...descriptionList);
        }

        // calculation
        formulaAlgorithmService.registerFunctions(calculate);

        return true;
    },
};
