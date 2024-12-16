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

import type { IDisposable, ILocales } from '@univerjs/core';
import type { IFunctionInfo, PrimitiveValueType } from '@univerjs/engine-formula';
import { createIdentifier, Disposable, DisposableCollection, Inject, LocaleService, Optional, toDisposable } from '@univerjs/core';
import { CustomFunction, FunctionType, IFunctionService } from '@univerjs/engine-formula';
import { IDescriptionService } from './description.service';
import { IRemoteRegisterFunctionService } from './remote/remote-register-function.service';

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
}

export const IRegisterFunctionService = createIdentifier<IRegisterFunctionService>(
    'sheets-formula.register-function-service'
);

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
