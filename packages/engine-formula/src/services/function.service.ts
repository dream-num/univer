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

import type { IAccessor, IDisposable, Nullable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier, Disposable, Inject, Injector, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { IFunctionInfo, IFunctionNames } from '../basics/function';
import type { BaseFunction } from '../functions/base-function';
import { FUNCTION_NAMES_TEXT } from '../functions/text/function-names';
import { FormulaCacheService } from './formula-cache.service';

export interface IFunctionRegistration {
    readonly name: IFunctionNames;
    /** Create a fresh executor using services from the target calculation context. */
    readonly create: (accessor: IAccessor) => BaseFunction;
}

export interface IFunctionService {
    readonly functionVersion: number;
    readonly functionsChanged$: Observable<readonly IFunctionNames[]>;
    registerFunctionFactories(...registrations: IFunctionRegistration[]): IDisposable;
    getFunctionRegistrations(): readonly IFunctionRegistration[];
    /**
     * Use register to register a function, new CustomFunction(inject, name)
     */
    registerExecutors(...functions: BaseFunction[]): void;

    getExecutors(): Map<IFunctionNames, BaseFunction>;

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
    getExecutor(functionToken: IFunctionNames): Nullable<BaseFunction>;

    hasExecutor(functionToken: IFunctionNames): boolean;

    unregisterExecutors(...functionTokens: IFunctionNames[]): void;

    registerDescriptions(...functions: IFunctionInfo[]): IDisposable;

    getDescriptions(): Map<IFunctionNames, IFunctionInfo>;

    getDescription(functionToken: IFunctionNames): IFunctionInfo | undefined;

    hasDescription(functionToken: IFunctionNames): boolean;

    unregisterDescriptions(...functionTokens: IFunctionNames[]): void;

    clearDescriptions(): void;

    deleteFormulaAstCacheKey(...functionToken: IFunctionNames[]): void;
}
export const IFunctionService = createIdentifier<IFunctionService>('univer.formula-function.service');

export class FunctionService extends Disposable implements IFunctionService {
    private readonly _registrations = new Map<IFunctionNames, { definition: IFunctionRegistration; executor: BaseFunction }>();
    private readonly _functionsChanged = new Subject<readonly IFunctionNames[]>();
    readonly functionsChanged$: Observable<readonly IFunctionNames[]> = this._functionsChanged.asObservable();
    private _functionVersion = 0;
    get functionVersion(): number { return this._functionVersion; }
    private _functionExecutors: Map<IFunctionNames, BaseFunction> = new Map();

    private _functionDescriptions: Map<IFunctionNames, IFunctionInfo> = new Map();

    constructor(
        @Inject(FormulaCacheService) private readonly _cacheService: FormulaCacheService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();
        this._functionExecutors.clear();
        this._functionDescriptions.clear();
        this._registrations.clear();
        this._functionsChanged.complete();
    }

    registerExecutors(...functions: BaseFunction[]) {
        const changed = new Set<IFunctionNames>();
        for (const func of functions) {
            if (this._functionExecutors.get(func.name) === func) {
                continue;
            }
            this._functionExecutors.set(func.name, func);
            this._registrations.delete(func.name);
            changed.add(func.name);
        }
        this._publishChanges([...changed]);
    }

    registerFunctionFactories(...registrations: IFunctionRegistration[]): IDisposable {
        // Construct the whole batch before changing the live registry or its caches.
        const entries = registrations.map(({ name, create }) => {
            const executor = create(this._injector);
            if (executor.name !== name) {
                throw new Error(`Function factory name mismatch: ${name}`);
            }
            return { definition: { name, create }, executor };
        });
        for (const entry of entries) {
            this._registrations.set(entry.definition.name, entry);
            this._functionExecutors.set(entry.definition.name, entry.executor);
        }
        this._publishChanges([...new Set(entries.map(({ definition }) => definition.name))]);
        return toDisposable(() => {
            const names = entries.filter((entry) => this._registrations.get(entry.definition.name) === entry)
                .map(({ definition }) => definition.name);
            this.unregisterExecutors(...names);
        });
    }

    getFunctionRegistrations(): readonly IFunctionRegistration[] {
        return Array.from(this._functionExecutors, ([name, executor]) => {
            const registration = this._registrations.get(name);
            if (registration?.executor !== executor) {
                throw new Error(`No factory registered for function: ${name}`);
            }
            return { ...registration.definition };
        });
    }

    private _publishChanges(names: IFunctionNames[]): void {
        if (names.length) {
            this._cacheService.clearFunctions(names);
            this._functionVersion++;
            this._functionsChanged.next(names);
        }
    }

    getExecutors() {
        return this._functionExecutors;
    }

    getExecutor(functionToken: IFunctionNames) {
        const executor = this._functionExecutors.get(functionToken);
        if (executor == null && functionToken === FUNCTION_NAMES_TEXT.REGEXTEST) {
            return this._functionExecutors.get(FUNCTION_NAMES_TEXT.REGEXMATCH);
        }
        return executor;
    }

    hasExecutor(functionToken: IFunctionNames) {
        return this.getExecutor(functionToken) != null;
    }

    unregisterExecutors(...functionTokens: IFunctionNames[]) {
        const changed: IFunctionNames[] = [];
        for (const token of functionTokens) {
            if (this._functionExecutors.delete(token)) {
                this._registrations.delete(token);
                changed.push(token);
            }
        }
        this._publishChanges(changed);
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

    clearDescriptions() {
        this._functionDescriptions.clear();
    }

    deleteFormulaAstCacheKey(...functionToken: IFunctionNames[]) {
        this._cacheService.clearFunctions(functionToken);
    }
}
