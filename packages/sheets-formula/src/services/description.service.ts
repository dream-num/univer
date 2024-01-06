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

import { LocaleService } from '@univerjs/core';
import type { IFunctionInfo, IFunctionNames } from '@univerjs/engine-formula';
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
    functionUniver,
    functionWeb,
    IFunctionService,
} from '@univerjs/engine-formula';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';

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
    registerDescriptions(functionList: IFunctionInfo[]): void;

    /**
     * unregister descriptions
     * @param functionList
     */
    unregisterDescriptions(functionNames: string[]): void;
}

export const IDescriptionService = createIdentifier<IDescriptionService>('formula-ui.description-service');

export class DescriptionService implements IDescriptionService, IDisposable {
    private _descriptions: IFunctionInfo[] = [];

    constructor(
        private _description: IFunctionInfo[] = [],
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
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
        searchText = searchText.toLocaleUpperCase();
        functionList.forEach((item) => {
            const { functionName, abstract } = item;
            if (functionName.indexOf(searchText) > -1) {
                searchList.push({ name: functionName, desc: abstract });
            }
        });

        return searchList;
    }

    getSearchListByNameFirstLetter(searchText: string) {
        const searchList: ISearchItem[] = [];
        const functionList = this._functionService.getDescriptions();
        searchText = searchText.toLocaleUpperCase();
        functionList.forEach((item) => {
            const { functionName, abstract } = item;
            if (functionName.indexOf(searchText) === 0) {
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
            if (functionType === type || type === -1) {
                searchList.push({ name: functionName, desc: abstract });
            }
        });

        return searchList;
    }

    registerDescriptions(description: IFunctionInfo[]) {
        this._descriptions = this._descriptions.concat(description);
        this._registerDescriptions();
    }

    unregisterDescriptions(functionNames: string[]) {
        this._descriptions = this._descriptions.filter((item) => !functionNames.includes(item.functionName));

        this._functionService.unregisterDescriptions(...functionNames);
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

        this._descriptions = filterFunctionList.concat(this._description);
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
