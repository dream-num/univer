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

import type { IDisposable } from '@univerjs/core';
import type { IFunctionInfo, IFunctionNames } from '@univerjs/engine-formula';
import type { IUniverSheetsFormulaBaseConfig } from '../config/config';
import { createIdentifier, Disposable, IConfigService, Inject, LocaleService, toDisposable } from '@univerjs/core';
import { ALL_IMPLEMENTED_FUNCTIONS_SET, FunctionType, IFunctionService, isReferenceStrings } from '@univerjs/engine-formula';
import { PLUGIN_CONFIG_KEY_BASE } from '../config/config';
import { FUNCTION_LIST } from './function-list/function-list';
import { getFunctionName } from './utils';

export interface ISearchItem {
    name: string;
    desc: string;
}

export interface ISearchItemWithType extends ISearchItem {
    functionType: FunctionType;
}

export interface IDescriptionService {
    /**
     * get all descriptions
     */
    getDescriptions(): Map<IFunctionNames, IFunctionInfo>;

    hasFunction(searchText: string): boolean;

    /**
     * get function info by name
     */
    getFunctionInfo(searchText: string): IFunctionInfo | undefined;

    /**
     * get search list by name
     */
    getSearchListByName(searchText: string): ISearchItem[];

    /**
     * get search list by name, from first letter
     */
    getSearchListByNameFirstLetter(searchText: string): ISearchItemWithType[];

    /**
     * get search list by type, if type is -1, return all
     */
    getSearchListByType(type: number): ISearchItem[];

    /**
     * register descriptions
     */
    registerDescriptions(functionList: IFunctionInfo[]): IDisposable;

    /**
     * unregister descriptions
     */
    unregisterDescriptions(functionNames: string[]): void;

    /**
     * check if has description
     */
    hasDescription(name: string): boolean;

    /**
     * check if has defined name description
     */
    hasDefinedNameDescription(name: string): boolean;

    /**
     * check if is formula defined name
     */
    isFormulaDefinedName(name: string): boolean;
}

export const IDescriptionService = createIdentifier<IDescriptionService>('formula.description-service');

export class DescriptionService extends Disposable implements IDescriptionService {
    private _descriptions: Map<IFunctionNames, IFunctionInfo> = new Map();

    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this.disposeWithMe(
            toDisposable(
                this._localeService.localeChanged$.subscribe(() => {
                    this._functionService.clearDescriptions();

                    const newDescriptions: Map<IFunctionNames, IFunctionInfo> = new Map();
                    this._descriptions.forEach((item) => {
                        const functionName = getFunctionName(item, this._localeService).toUpperCase();
                        newDescriptions.set(functionName, item);
                    });

                    this._descriptions = newDescriptions;
                    this._initRegisterDescriptions();
                })
            )
        );

        this._initDescriptions();
        this._initRegisterDescriptions();
    }

    private _initDescriptions() {
        const localeService = this._localeService;

        FUNCTION_LIST.forEach((item) => {
            if (ALL_IMPLEMENTED_FUNCTIONS_SET.has(item.functionName)) {
                const functionName = getFunctionName(item, localeService).toUpperCase();
                this._descriptions.set(functionName, item);
            }
        });

        const config = this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE);
        config?.description?.forEach((item) => {
            const functionName = getFunctionName(item, localeService).toUpperCase();
            this._descriptions.set(functionName, item);
        });
    }

    private _initRegisterDescriptions() {
        const localeService = this._localeService;

        const functionListLocale = Array.from(this._descriptions.values()).map((functionInfo) => ({
            functionName: getFunctionName(functionInfo, localeService),
            functionType: functionInfo.functionType,
            description: localeService.t(functionInfo.description),
            abstract: localeService.t(functionInfo.abstract),
            functionParameter: functionInfo.functionParameter.map((item) => ({
                name: localeService.t(item.name),
                detail: localeService.t(item.detail),
                example: item.example,
                require: item.require,
                repeat: item.repeat,
            })),
        }));

        this._functionService.registerDescriptions(...functionListLocale);
    }

    private _registerDescriptions(descriptions: IFunctionInfo[]) {
        const localeService = this._localeService;

        const functionListLocale = descriptions.map((functionInfo) => ({
            functionName: getFunctionName(functionInfo, localeService),
            functionType: functionInfo.functionType,
            description: localeService.t(functionInfo.description),
            abstract: localeService.t(functionInfo.abstract),
            functionParameter: functionInfo.functionParameter.map((item) => ({
                name: localeService.t(item.name),
                detail: localeService.t(item.detail),
                example: item.example,
                require: item.require,
                repeat: item.repeat,
            })),
        }));

        this._functionService.registerDescriptions(...functionListLocale);
    }

    override dispose(): void {
        super.dispose();

        this._descriptions.clear();
    }

    getDescriptions() {
        return this._functionService.getDescriptions();
    }

    hasFunction(searchText: string) {
        return this._descriptions.has(searchText.toUpperCase());
    }

    getFunctionInfo(searchText: string) {
        const item = this._descriptions.get(searchText.toUpperCase());
        if (!item) {
            return;
        }
        return this._functionService.getDescription(getFunctionName(item, this._localeService));
    }

    getSearchListByName(searchText: string) {
        const functionList = this._functionService.getDescriptions();
        const _searchText = searchText.toUpperCase().trim();

        const searchList: ISearchItem[] = [];

        functionList.forEach((item) => {
            const { functionName, abstract, functionType } = item;
            // Exclude DefinedName
            if ((functionName.toUpperCase().indexOf(_searchText) > -1) && functionType !== FunctionType.DefinedName) {
                searchList.push({ name: functionName, desc: abstract });
            }
        });

        return searchList;
    }

    getSearchListByNameFirstLetter(searchText: string) {
        const functionList = this._functionService.getDescriptions();
        const _searchText = searchText.toUpperCase().trim();

        const searchList: ISearchItemWithType[] = [];

        functionList.forEach((item) => {
            const { functionName, abstract, functionType } = item;
            if (functionName.toUpperCase().indexOf(_searchText) === 0) {
                searchList.push({ name: functionName, desc: abstract, functionType });
            }
        });

        return searchList;
    }

    getSearchListByType(type: number) {
        const functionList = this._functionService.getDescriptions();

        const searchList: ISearchItem[] = [];

        functionList.forEach((item) => {
            const { functionName, functionType, abstract } = item;
            // Exclude DefinedName
            if ((functionType === type || type === -1) && functionType !== FunctionType.DefinedName) {
                searchList.push({ name: functionName, desc: abstract });
            }
        });

        return searchList;
    }

    registerDescriptions(descriptions: IFunctionInfo[]): IDisposable {
        const localeService = this._localeService;
        const functionNames: string[] = [];

        descriptions.forEach((item) => {
            const functionName = getFunctionName(item, localeService).toUpperCase();
            functionNames.push(functionName);
            this._descriptions.set(functionName, item);
        });

        this._registerDescriptions(descriptions);

        return toDisposable(() => {
            this.unregisterDescriptions(functionNames);
        });
    }

    unregisterDescriptions(functionNames: string[]) {
        const removeFunctionNames: string[] = [];

        functionNames.forEach((name) => {
            const functionName = name.toUpperCase();
            const item = this._descriptions.get(functionName);
            if (!item) {
                return;
            }

            removeFunctionNames.push(getFunctionName(item, this._localeService));
            this._descriptions.delete(functionName);
        });

        this._functionService.unregisterDescriptions(...removeFunctionNames);
    }

    hasDescription(name: string) {
        return this._descriptions.has(name.toUpperCase());
    }

    hasDefinedNameDescription(name: string) {
        const item = this._descriptions.get(name.toUpperCase());
        if (!item) {
            return false;
        }
        return item.functionType === FunctionType.DefinedName;
    }

    isFormulaDefinedName(name: string) {
        const item = this._descriptions.get(name.toUpperCase());
        if (!item) {
            return false;
        }

        if (item.functionType !== FunctionType.DefinedName) {
            return false;
        }

        return !isReferenceStrings(item.description);
    }
}
