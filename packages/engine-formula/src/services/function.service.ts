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

import type { IDisposable } from '@univerjs/core';
import type { IFunctionInfo, IFunctionNames } from '../basics/function';
import type { BaseFunction } from '../functions/base-function';
import { Disposable, toDisposable } from '@univerjs/core';

/**
 * This stores function executors and descriptions. It both resident in host process and worker process, though
 * descriptions will not be registered in the worker process.
 */
export class FunctionService extends Disposable {
    private _functionExecutors: Map<IFunctionNames, BaseFunction> = new Map();
    private _functionDescriptions: Map<IFunctionNames, IFunctionInfo> = new Map();

    override dispose(): void {
        this._functionExecutors.clear();
        this._functionDescriptions.clear();
    }

    /**
     * Use register to register a function, new CustomFunction(inject, name)
     */
    registerExecutors(...functions: BaseFunction[]) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            this._functionExecutors.set(func.name, func);
        }
    }

    getExecutors() {
        return this._functionExecutors;
    }

    /**
     * Obtain the operator of the function to reuse the calculation logic.
     * The argument type accepted by the function is: FunctionVariantType.
     * For instance, the sum formula capability is needed for the statistics bar.
     * You can obtain the calculation result by using
     * const sum = formulaService.getExecutor(FUNCTION_NAMES_MATH.SUM);
     * sum.calculate(new RangeReferenceObject(range, sheetId, unitId), ref2, re3).
     * @param functionName Function name, which can be obtained through the FUNCTION_NAMES enumeration.
     * @returns
     */
    getExecutor(functionToken: IFunctionNames) {
        return this._functionExecutors.get(functionToken);
    }

    hasExecutor(functionToken: IFunctionNames) {
        return this._functionExecutors.has(functionToken);
    }

    unregisterExecutors(...functionTokens: IFunctionNames[]) {
        for (let i = 0; i < functionTokens.length; i++) {
            const functionToken = functionTokens[i];
            this._functionExecutors.delete(functionToken);
        }
    }

    registerDescriptions(...descriptions: IFunctionInfo[]): IDisposable {
        for (let i = 0; i < descriptions.length; i++) {
            const description = descriptions[i];
            this._functionDescriptions.set(description.functionName, description);
        }

        return toDisposable(() => {
            for (let i = 0; i < descriptions.length; i++) {
                const description = descriptions[i];
                this._functionDescriptions.delete(description.functionName);
            }
        });
    }

    getDescriptions() {
        return this._functionDescriptions;
    }

    getDescription(functionToken: IFunctionNames) {
        return this._functionDescriptions.get(functionToken);
    }

    hasDescription(functionToken: IFunctionNames) {
        return this._functionDescriptions.has(functionToken);
    }

    unregisterDescriptions(...functionTokens: IFunctionNames[]) {
        for (let i = 0; i < functionTokens.length; i++) {
            const functionToken = functionTokens[i];
            this._functionDescriptions.delete(functionToken);
        }
    }
}
