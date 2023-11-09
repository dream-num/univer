import { Disposable, Nullable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import { FUNCTION_NAMES, IFunctionInfo } from '../Basics/Function';
import { BaseFunction } from '../Functions/BaseFunction';

export interface IFunctionService {
    registerExecutors(...functions: BaseFunction[]): void;

    getExecutors(): Map<string, BaseFunction>;

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
