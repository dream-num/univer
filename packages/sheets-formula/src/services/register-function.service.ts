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

import type { IDisposable, ILocales } from '@univerjs/core';
import type { FormulaFunctionResultValueType, FormulaFunctionValueType, IFunctionInfo } from '@univerjs/engine-formula';
import { createIdentifier, Disposable, DisposableCollection, Inject, LocaleService, Optional, toDisposable } from '@univerjs/core';
import { AsyncCustomFunction, CustomFunction, FunctionType, IFunctionService } from '@univerjs/engine-formula';
import { IDescriptionService } from './description.service';
import { IRemoteRegisterFunctionService } from './remote/remote-register-function.service';

export type IRegisterFunction = (
    ...arg: Array<FormulaFunctionValueType>
) => FormulaFunctionResultValueType;

export type IRegisterAsyncFunction = (
    ...arg: Array<FormulaFunctionValueType>
) => Promise<FormulaFunctionResultValueType>;

// [[Function, FunctionName, Description]]
export type IRegisterFunctionList = [[IRegisterFunction, string, string?]];

export interface IFormulaCustomFunctionService {
    /**
     * register descriptions
     * @param functionList
     */
    registerFunctions(functionList: IRegisterFunctionList): IDisposable;
}

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

/**
 * This
 */
export interface IRegisterFunctionService {
    /**
     * register descriptions
     * @param params
     */
    registerFunctions(params: IRegisterFunctionParams): IDisposable;

    /**
     * register a single function
     * @param params
     */
    registerFunction(params: ISingleFunctionRegisterParams): IDisposable;

    /**
     * register a single async function
     * @param params
     */
    registerAsyncFunction(params: ISingleFunctionRegisterParams): IDisposable;
}

export const IRegisterFunctionService = createIdentifier<IRegisterFunctionService>(
    'sheets-formula.register-function-service'
);

export interface ISingleFunctionRegisterParams {
    /**
     * function name
     */
    name: string;
    /**
     * function calculation
     */
    func: IRegisterFunction | IRegisterAsyncFunction;
    /**
     * function description
     */
    description: string | IFunctionInfo;
    /**
     * function locales
     */
    locales?: ILocales;
    /**
     * function async
     */
    async?: boolean;
}

export class RegisterFunctionService extends Disposable implements IRegisterFunctionService {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(IDescriptionService) private readonly _descriptionService: IDescriptionService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @Optional(IRemoteRegisterFunctionService)
        private readonly _remoteRegisterFunctionService?: IRemoteRegisterFunctionService
    ) {
        super();
    }

    registerFunction(params: ISingleFunctionRegisterParams): IDisposable {
        return this._registerSingleFunction(params);
    }

    registerAsyncFunction(params: ISingleFunctionRegisterParams): IDisposable {
        return this._registerSingleFunction({ ...params, async: true });
    }

    registerFunctions(params: IRegisterFunctionParams): IDisposable {
        const { locales, description, calculate } = params;

        // i18n
        if (locales) {
            // dispose is not supported yet
            this._localeService.load(locales);
        }

        const disposables = new DisposableCollection();
        if (description) {
            disposables.add(this._descriptionService.registerDescriptions(description));
        } else {
            const descriptionList: IFunctionInfo[] = calculate.map(([_func, functionName, functionIntroduction]) => {
                return {
                    functionName,
                    functionType: FunctionType.User,
                    description: '',
                    abstract: functionIntroduction || '',
                    functionParameter: [],
                };
            });

            disposables.add(this._functionService.registerDescriptions(...descriptionList));
        }

        // calculation
        disposables.add(this._registerLocalExecutors(calculate));
        if (this._remoteRegisterFunctionService) {
            disposables.add(this._registerRemoteExecutors(calculate));
        }

        return disposables;
    }

    private _registerSingleFunction(params: ISingleFunctionRegisterParams): IDisposable {
        const { name, func, description, locales, async = false } = params;
        const disposables = new DisposableCollection();

        // Handle i18n
        if (locales) {
            this._localeService.load(locales);
        }

        // Handle description
        if (typeof description === 'string') {
            const functionInfo: IFunctionInfo = {
                functionName: name,
                functionType: FunctionType.User,
                description,
                abstract: description || '',
                functionParameter: [],
            };
            disposables.add(this._descriptionService.registerDescriptions([functionInfo]));
        } else {
            disposables.add(this._descriptionService.registerDescriptions([description]));
        }

        // Handle function registration
        const instance = async ? new AsyncCustomFunction(name) : new CustomFunction(name);
        instance.calculateCustom = func;
        this._functionService.registerExecutors(instance);
        disposables.add(toDisposable(() => this._functionService.unregisterExecutors(name)));
        disposables.add(toDisposable(() => this._functionService.unregisterDescriptions(name)));
        disposables.add(toDisposable(() => this._functionService.deleteFormulaAstCacheKey(name)));

        // Handle remote registration if available
        if (this._remoteRegisterFunctionService) {
            this._remoteRegisterFunctionService.registerAsyncFunctions([[func.toString(), name]]);
            disposables.add(
                toDisposable(() => this._remoteRegisterFunctionService!.unregisterFunctions([name]))
            );
        }

        return disposables;
    }

    private _registerLocalExecutors(list: IRegisterFunctionList): IDisposable {
        const names = list.map(([_func, name]) => name);
        const functions = list.map(([func, name]) => {
            const instance = new CustomFunction(name);
            instance.calculateCustom = func;
            return instance;
        });

        this._functionService.registerExecutors(...functions);
        return toDisposable(() => this._functionService.unregisterExecutors(...names));
    }

    private _registerRemoteExecutors(list: IRegisterFunctionList): IDisposable {
        const functionNameList: string[] = []; // used to unregister functions
        const functions = list.map(([func, name]) => {
            functionNameList.push(name);
            return [func.toString(), name] as [string, string];
        });

        this._remoteRegisterFunctionService!.registerFunctions(functions);
        return toDisposable(() => this._remoteRegisterFunctionService!.unregisterFunctions(functionNameList));
    }
}
