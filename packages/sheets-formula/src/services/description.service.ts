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
import type { IUniverSheetsFormulaBaseConfig } from '../controllers/config.schema';
import { createIdentifier, IConfigService, Inject, LocaleService, toDisposable } from '@univerjs/core';

import {
    functionArray,
    functionCompatibility,
    functionCube,
    functionDatabase,
    functionDate,
    functionEngineering,
    functionFinancial,
    functionInformation,
    functionLogical,
    functionLookup,
    functionMath,
    functionMeta,
    functionStatistical,
    functionText,
    FunctionType,
    functionUniver,
    functionWeb,
    IFunctionService,
    isReferenceStrings,
} from '@univerjs/engine-formula';
import { PLUGIN_CONFIG_KEY_BASE } from '../controllers/config.schema';
import { FUNCTION_LIST } from './function-list/function-list';
import { getFunctionName } from './utils';

export interface ISearchItem {
    name: string;
    desc: string;
}

export interface IDescriptionService {
    /**
     * get all descriptions
     */
    getDescriptions(): Map<IFunctionNames, IFunctionInfo>;

    hasFunction(searchText: string): boolean;

    /**
     * get function info by name
     * @param searchText
     */
    getFunctionInfo(searchText: string): IFunctionInfo | undefined;

    /**
     * get search list by name
     * @param searchText
     * @returns
     */
    getSearchListByName(searchText: string): ISearchItem[];

    /**
     * get search list by name, from first letter
     * @param searchText
     * @returns
     */
    getSearchListByNameFirstLetter(searchText: string): ISearchItem[];

    /**
     * get search list by type, if type is -1, return all
     * @param type
     * @returns
     */
    getSearchListByType(type: number): ISearchItem[];

    /**
     * register descriptions
     * @param functionList
     */
    registerDescriptions(functionList: IFunctionInfo[]): IDisposable;

    /**
     * unregister descriptions
     * @param functionList
     */
    unregisterDescriptions(functionNames: string[]): void;

    /**
     * check if has description
     * @param name
     */
    hasDescription(name: string): boolean;

    /**
     * check if has defined name description
     * @param name
     */
    hasDefinedNameDescription(name: string): boolean;

    /**
     * check if is formula defined name
     * @param name
     */
    isFormulaDefinedName(name: string): boolean;
}

export const IDescriptionService = createIdentifier<IDescriptionService>('formula.description-service');

export class DescriptionService implements IDescriptionService, IDisposable {
    private _descriptions: IFunctionInfo[] = [];

    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        this._initialize();
    }

    dispose(): void {
        this._localeService.localeChanged$.complete();
    }

    getDescriptions() {
        return this._functionService.getDescriptions();
    }

    hasFunction(searchText: string) {
        const functionList = this._functionService.getDescriptions();
        return functionList.get(searchText.toLocaleUpperCase()) !== undefined;
    }

    getFunctionInfo(searchText: string) {
        const functionList = this._functionService.getDescriptions();
        return functionList.get(searchText.toLocaleUpperCase());
    }

    getSearchListByName(searchText: string) {
        const searchList: ISearchItem[] = [];
        const functionList = this._functionService.getDescriptions();
        const _searchText = searchText.toLocaleUpperCase().trim();
        functionList.forEach((item) => {
            const { functionName, abstract, functionType } = item;
            // Exclude DefinedName
            if ((functionName.toLocaleUpperCase().indexOf(_searchText) > -1) && functionType !== FunctionType.DefinedName) {
                searchList.push({ name: functionName, desc: abstract });
            }
        });

        return searchList;
    }

    getSearchListByNameFirstLetter(searchText: string) {
        const searchList: ISearchItem[] = [];
        const functionList = this._functionService.getDescriptions();
        const _searchText = searchText.toLocaleUpperCase().trim();
        functionList.forEach((item) => {
            const { functionName, abstract } = item;
            if (functionName.toLocaleUpperCase().indexOf(_searchText) === 0) {
                searchList.push({ name: functionName, desc: abstract });
            }
        });

        return searchList;
    }

    getSearchListByType(type: number) {
        const searchList: ISearchItem[] = [];
        const functionList = this._functionService.getDescriptions();
        functionList.forEach((item) => {
            const { functionName, functionType, abstract } = item;
            // Exclude DefinedName
            if ((functionType === type || type === -1) && functionType !== FunctionType.DefinedName) {
                searchList.push({ name: functionName, desc: abstract });
            }
        });

        return searchList;
    }

    registerDescriptions(description: IFunctionInfo[]): IDisposable {
        this._descriptions = this._descriptions.concat(description);
        this._registerDescriptions();

        return toDisposable(() => {
            const functionNames = description.map((item) => item.functionName);
            this.unregisterDescriptions(functionNames);
        });
    }

    unregisterDescriptions(functionNames: string[]) {
        this._descriptions = this._descriptions.filter((item) => !functionNames.includes(item.functionName));

        this._functionService.unregisterDescriptions(...functionNames);
    }

    hasDescription(name: string) {
        return this._descriptions.some((item) => item.functionName === name);
    }

    hasDefinedNameDescription(name: string) {
        return this._descriptions.some((item) => item.functionName === name && item.functionType === FunctionType.DefinedName);
    }

    isFormulaDefinedName(name: string) {
        const items = this._descriptions.filter((item) => item.functionName === name && item.functionType === FunctionType.DefinedName);
        if (items.length === 0) {
            return false;
        }

        const token = items[0].description;
        return !isReferenceStrings(token);
    }

    private _initialize() {
        this._localeService.localeChanged$.subscribe(() => {
            this._registerDescriptions();
        });

        this._initDescription();
        this._registerDescriptions();
    }

    private _initDescription() {
        // TODO@Dushusir: Remove filtering after all formulas have been implemented
        const functions = [
            ...functionArray,
            ...functionCompatibility,
            ...functionCube,
            ...functionDatabase,
            ...functionDate,
            ...functionEngineering,
            ...functionFinancial,
            ...functionInformation,
            ...functionLogical,
            ...functionLookup,
            ...functionMath,
            ...functionMeta,
            ...functionStatistical,
            ...functionText,
            ...functionUniver,
            ...functionWeb,
        ].map((item) => item[1]) as IFunctionNames[];

        const filterFunctionList = FUNCTION_LIST.filter((item) => {
            return functions.includes(item.functionName as IFunctionNames);
        });

        const config = this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE);
        this._descriptions = filterFunctionList.concat(config?.description ?? []);
    }

    private _registerDescriptions() {
        const localeService = this._localeService;

        const functionListLocale = this._descriptions.map((functionInfo) => ({
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
}
