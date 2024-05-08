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

import { Disposable, ICommandService, toDisposable } from '@univerjs/core';
import type { PrimitiveValueType } from '@univerjs/engine-formula';
import { RegisterFunctionMutation, UnregisterFunctionMutation } from '@univerjs/engine-formula';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';

export type IRegisterFunction = (
    ...arg: Array<PrimitiveValueType | PrimitiveValueType[][]>
) => PrimitiveValueType | PrimitiveValueType[][];

// [[Function, FunctionName, Description]]
export type IRegisterFunctionList = [[IRegisterFunction, string, string?]];

export interface IFormulaCustomFunctionService {
    /**
     * register descriptions
     * @param functionList
     */
    registerFunctions(functionList: IRegisterFunctionList): IDisposable;
}

export const IFormulaCustomFunctionService = createIdentifier<IFormulaCustomFunctionService>(
    'formula-ui.formula-custom-function-service'
);

export class FormulaCustomFunctionService extends Disposable implements IFormulaCustomFunctionService {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();
    }

    registerFunctions(functionList: IRegisterFunctionList): IDisposable {
        const functionNameList: string[] = []; // used to unregister functions
        const functions = functionList.map((func) => {
            functionNameList.push(func[1]);
            return [func[0].toString(), func[1]];
        });

        // Synchronous to worker
        this._commandService.executeCommand(
            RegisterFunctionMutation.id,
            {
                functions,
            },
            {
                local: true,
            }
        );

        return toDisposable(() => {
            this._commandService.executeCommand(
                UnregisterFunctionMutation.id,
                {
                    functions: functionNameList,
                },
                {
                    local: true,
                }
            );
        });
    }
}
