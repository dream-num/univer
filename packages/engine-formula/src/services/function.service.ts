import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { FUNCTION_NAMES, IFunctionInfo } from '../basics/function';
import type { BaseFunction } from '../functions/base-function';

export interface IFunctionService {
    /**
     * Use register to register a function, new CustomFunction(inject, name)
     */
    registerExecutors(...functions: BaseFunction[]): void;

    getExecutors(): Map<string, BaseFunction>;

    /**
     * Obtain the operator of the function to reuse the calculation logic.
     * The argument type accepted by the function is: FunctionVariantType.
     * For instance, the sum formula capability is needed for the statistics bar.
     * You can obtain the calculation result by using
     * const sum = formulaService.getExecutor(FUNCTION_NAMES.SUM);
     * sum.calculate(new RangeReferenceObject(range, sheetId, unitId), ref2, re3).
     * @param functionName Function name, which can be obtained through the FUNCTION_NAMES enumeration.
     * @returns
     */
    getExecutor(functionToken: string): Nullable<BaseFunction>;

    hasExecutor(functionToken: string): boolean;

    registerDescriptions(...functions: IFunctionInfo[]): void;

    getDescriptions(): Map<string, IFunctionInfo>;

    getDescription(functionToken: string): Nullable<IFunctionInfo>;

    hasDescription(functionToken: string): boolean;
}

export class FunctionService extends Disposable implements IFunctionService {
    private _functionExecutors: Map<string, BaseFunction> = new Map();

    private _functionDescriptions: Map<string, IFunctionInfo> = new Map();

    override dispose(): void {
        this._functionExecutors.clear();
        this._functionDescriptions.clear();
    }

    registerExecutors(...functions: BaseFunction[]) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            this._functionExecutors.set(func.name, func);
        }
    }

    getExecutors() {
        return this._functionExecutors;
    }

    getExecutor(functionToken: string | FUNCTION_NAMES) {
        return this._functionExecutors.get(functionToken);
    }

    hasExecutor(functionToken: string | FUNCTION_NAMES) {
        return this._functionExecutors.has(functionToken);
    }

    registerDescriptions(...descriptions: IFunctionInfo[]) {
        for (let i = 0; i < descriptions.length; i++) {
            const description = descriptions[i];
            this._functionDescriptions.set(description.functionName, description);
        }
    }

    getDescriptions() {
        return this._functionDescriptions;
    }

    getDescription(functionToken: string) {
        return this._functionDescriptions.get(functionToken);
    }

    hasDescription(functionToken: string) {
        return this._functionDescriptions.has(functionToken);
    }
}

export const IFunctionService = createIdentifier<FunctionService>('univer.formula.function.service');
