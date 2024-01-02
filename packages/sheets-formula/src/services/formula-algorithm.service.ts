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

import { Disposable, ICommandService } from '@univerjs/core';
import type { PrimitiveValueType } from '@univerjs/engine-formula';
import { IFunctionService, RegisterFunctionMutation } from '@univerjs/engine-formula';
import { createIdentifier } from '@wendellhu/redi';

export type IRegisterFunction = (
    ...arg: Array<PrimitiveValueType | PrimitiveValueType[][]>
) => PrimitiveValueType | PrimitiveValueType[][];

export type IRegisterFunctionList = [[IRegisterFunction, string, string?]];

export interface IFormulaAlgorithmService {
    /**
     * register descriptions
     * @param functionList
     */
    registerFunctions(functionList: IRegisterFunctionList): void;
}

export const IFormulaAlgorithmService = createIdentifier<IFormulaAlgorithmService>(
    'formula-ui.formula-algorithm-service'
);

export class FormulaAlgorithmService extends Disposable implements IFormulaAlgorithmService {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    registerFunctions(functionList: IRegisterFunctionList) {
        const functions = functionList.map((func) => [func[0].toString(), func[1], func[2] || '']);

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
    }
}
