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
import type { IFunctionInfo, IFunctionNames } from '../../basics/function';
import { createIdentifier, Disposable, Inject, LocaleService, toDisposable } from '@univerjs/core';
import { FunctionType } from '../../basics/function';
import { isReferenceStrings } from '../../engine/utils/reference';
import { ALL_IMPLEMENTED_FUNCTIONS_SET } from '../../functions';
import arSaLocale from '../../locale/function-list/math/ar-SA';
import caEsLocale from '../../locale/function-list/math/ca-ES';
import deDeLocale from '../../locale/function-list/math/de-DE';
import enUsLocale from '../../locale/function-list/math/en-US';
import esEsLocale from '../../locale/function-list/math/es-ES';
import frFrLocale from '../../locale/function-list/math/fr-FR';
import idIdLocale from '../../locale/function-list/math/id-ID';
import itItLocale from '../../locale/function-list/math/it-IT';
import jaJpLocale from '../../locale/function-list/math/ja-JP';
import koKrLocale from '../../locale/function-list/math/ko-KR';
import plPlLocale from '../../locale/function-list/math/pl-PL';
import ptBrLocale from '../../locale/function-list/math/pt-BR';
import ruRuLocale from '../../locale/function-list/math/ru-RU';
import skSkLocale from '../../locale/function-list/math/sk-SK';
import viVnLocale from '../../locale/function-list/math/vi-VN';
import zhCnLocale from '../../locale/function-list/math/zh-CN';
import zhTwLocale from '../../locale/function-list/math/zh-TW';
import { IFunctionService } from '../function.service';
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

// Map of locale identifiers to their locale data
const LOCALE_FUNCTION_LABELS: Record<string, Record<string, any>> = {
    arSA: arSaLocale as any,
    'ar-SA': arSaLocale as any,
    caES: caEsLocale as any,
    'ca-ES': caEsLocale as any,
    deDE: deDeLocale as any,
    'de-DE': deDeLocale as any,
    enUS: enUsLocale as any,
    'en-US': enUsLocale as any,
    esES: esEsLocale as any,
    'es-ES': esEsLocale as any,
    frFR: frFrLocale as any,
    'fr-FR': frFrLocale as any,
    idID: idIdLocale as any,
    'id-ID': idIdLocale as any,
    itIT: itItLocale as any,
    'it-IT': itItLocale as any,
    jaJP: jaJpLocale as any,
    'ja-JP': jaJpLocale as any,
    koKR: koKrLocale as any,
    'ko-KR': koKrLocale as any,
    plPL: plPlLocale as any,
    'pl-PL': plPlLocale as any,
    ptBR: ptBrLocale as any,
    'pt-BR': ptBrLocale as any,
    ruRU: ruRuLocale as any,
    'ru-RU': ruRuLocale as any,
    skSK: skSkLocale as any,
    'sk-SK': skSkLocale as any,
    viVN: viVnLocale as any,
    'vi-VN': viVnLocale as any,
    zhCN: zhCnLocale as any,
    'zh-CN': zhCnLocale as any,
    zhTW: zhTwLocale as any,
    'zh-TW': zhTwLocale as any,
};

function getLocaleLabels(locale: string): Record<string, any> | undefined {
    return LOCALE_FUNCTION_LABELS[locale];
}

export class DescriptionService extends Disposable implements IDescriptionService {
    private _descriptions: Map<IFunctionNames, IFunctionInfo> = new Map();

    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
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
                    // Rebuild alias map when locale changes
                    this._functionService.buildFunctionAliasMap();
                })
            )
        );

        this._initDescriptions();
        this._initRegisterDescriptions();
        // Initial alias map build
        this._functionService.buildFunctionAliasMap();
    }

    private _initDescriptions() {
        const localeService = this._localeService;

        FUNCTION_LIST.forEach((item) => {
            if (ALL_IMPLEMENTED_FUNCTIONS_SET.has(item.functionName)) {
                const functionName = getFunctionName(item, localeService).toUpperCase();
                this._descriptions.set(functionName, item);
            }
        });
    }

    private _initRegisterDescriptions() {
        const localeService = this._localeService;
        const currentLocale = localeService.getCurrentLocale();
        const localeLabels = getLocaleLabels(currentLocale);

        const functionListLocale = Array.from(this._descriptions.values()).map((functionInfo) => {
            const result: any = {
                functionName: functionInfo.functionName,
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
            };

            // Add locale-specific label from locale file if available
            if (localeLabels) {
                const localeEntry = localeLabels[functionInfo.functionName];
                if (localeEntry && localeEntry.label) {
                    result.label = localeEntry.label;
                }
            }

            // Fallback: also check if the original function info has a label
            if (!result.label && (functionInfo as any).label) {
                result.label = (functionInfo as any).label;
            }

            return result;
        });

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
        const resolvedName = (this._functionService.resolveFunctionName(searchText)).toString();
        return this._descriptions.has(resolvedName.toUpperCase());
    }

    getFunctionInfo(searchText: string) {
        const resolvedName = (this._functionService.resolveFunctionName(searchText)).toString();
        const item = this._descriptions.get(resolvedName.toUpperCase());
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
            // Get localized name (label if available, otherwise functionName)
            const displayName = (item as any).label || functionName;
            // Exclude DefinedName
            if ((displayName.toUpperCase().indexOf(_searchText) > -1 || functionName.toUpperCase().indexOf(_searchText) > -1) && functionType !== FunctionType.DefinedName) {
                searchList.push({ name: displayName, desc: abstract });
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
            // Get localized name (label if available, otherwise functionName)
            const displayName = (item as any).label || functionName;
            if (displayName.toUpperCase().indexOf(_searchText) === 0) {
                searchList.push({ name: displayName, desc: abstract, functionType });
            }
        });

        return searchList;
    }

    getSearchListByType(type: number) {
        const functionList = this._functionService.getDescriptions();

        const searchList: ISearchItem[] = [];

        functionList.forEach((item) => {
            const { functionName, functionType, abstract } = item;
            // Get localized name (label if available, otherwise functionName)
            const displayName = (item as any).label || functionName;
            // Exclude DefinedName
            if ((functionType === type || type === -1) && functionType !== FunctionType.DefinedName) {
                searchList.push({ name: displayName, desc: abstract });
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
        const resolvedName = (this._functionService.resolveFunctionName(name)).toString();
        return this._descriptions.has(resolvedName.toUpperCase());
    }

    hasDefinedNameDescription(name: string) {
        const resolvedName = (this._functionService.resolveFunctionName(name)).toString();
        const item = this._descriptions.get(resolvedName.toUpperCase());
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
