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
import { createIdentifier, Disposable, DisposableCollection, Inject, LocaleService, toDisposable } from '@univerjs/core';
import type { IFunctionInfo } from '../../basics/function';
import type {
    FormulaFunctionResultValueType,
    FormulaFunctionValueType,
} from '../../engine/value-object/primitive-object';
import { FunctionType } from '../../basics/function';
import { AsyncCustomFunction, CustomFunction } from '../../functions/custom-function';
import { IFunctionService } from '../function.service';
import { IDescriptionService } from './description.service';

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
    'formula.register-function-service'
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
        @IFunctionService private readonly _functionService: IFunctionService
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

        const descriptions: IFunctionInfo[] = description ?? calculate.map(([_func, functionName, functionIntroduction]) => {
            return {
                functionName,
                functionType: FunctionType.User,
                description: '',
                abstract: functionIntroduction || '',
                functionParameter: [],
            };
        });

        disposables.add(this._descriptionService.registerDescriptions(descriptions));

        // calculation
        disposables.add(this._registerLocalExecutors(calculate));

        return disposables;
    }

    private _registerSingleFunction(params: ISingleFunctionRegisterParams): IDisposable {
        const { name, func, description, locales, async = false } = params;
        // Handle i18n
        if (locales) {
            this._localeService.load(locales);
        }

        // Handle description
        let descriptionRegistration: IDisposable;
        if (typeof description === 'string') {
            const functionInfo: IFunctionInfo = {
                functionName: name,
                functionType: FunctionType.User,
                description,
                abstract: description || '',
                functionParameter: [],
            };
            descriptionRegistration = this._descriptionService.registerDescriptions([functionInfo]);
        } else {
            descriptionRegistration = this._descriptionService.registerDescriptions([description]);
        }

        // Handle function registration
        const registration = this._functionService.registerFunctionFactories({ name, create: () => {
            const instance = async ? new AsyncCustomFunction(name) : new CustomFunction(name);
            instance.calculateCustom = func;
            return instance;
        } });
        const executor = this._functionService.getExecutor(name);
        return toDisposable(() => {
            if (this._functionService.getExecutor(name) === executor) {
                descriptionRegistration.dispose();
                this._functionService.unregisterDescriptions(name);
            }
            registration.dispose();
        });
    }

    private _registerLocalExecutors(list: IRegisterFunctionList): IDisposable {
        return this._functionService.registerFunctionFactories(...list.map(([func, name]) => ({ name, create: () => {
            const instance = new CustomFunction(name);
            instance.calculateCustom = func;
            return instance;
        } })));
    }
}
