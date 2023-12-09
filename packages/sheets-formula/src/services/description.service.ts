import { LocaleService } from '@univerjs/core';
import type { IFunctionInfo, IFunctionNames } from '@univerjs/engine-formula';
import { IFunctionService } from '@univerjs/engine-formula';
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
     * get search list by type, if type is -1, return all
     * @param type
     * @returns
     */
    getSearchListByType(type: number): ISearchItem[];
}

export const IDescriptionService = createIdentifier<IDescriptionService>('formula-ui.description-service');

export class DescriptionService implements IDescriptionService, IDisposable {
    constructor(
        private _description: IFunctionInfo[],
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        this._initialize();
        this._registerDescription();
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

    private _initialize() {
        this._localeService.localeChanged$.subscribe(() => {
            this._registerDescription();
        });
    }

    private _registerDescription() {
        const localeService = this._localeService;
        const functionList = FUNCTION_LIST.concat(this._description || []);
        const functionListLocale = functionList.map((functionInfo) => ({
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
