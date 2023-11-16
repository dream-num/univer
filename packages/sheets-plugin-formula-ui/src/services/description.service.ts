import { FormulaEngineService, IFunctionInfo } from '@univerjs/base-formula-engine';
import { LocaleService } from '@univerjs/core';
import { createIdentifier, IDisposable, Inject } from '@wendellhu/redi';

import { FUNCTION_LIST } from './function-list/function-list';
import { getRealFunctionName } from './utils';

export interface IDescriptionService {
    getDescriptions(): Map<string, IFunctionInfo>;
}

export const IDescriptionService = createIdentifier<IDescriptionService>('formula-ui.description-service');

export class DescriptionService implements IDescriptionService, IDisposable {
    constructor(
        private _description: IFunctionInfo[],
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        this._initialize();
        this._registerDescription();
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
            functionName: getRealFunctionName(functionInfo, localeService),
            functionType: functionInfo.functionType,
            description: localeService.t(functionInfo.description),
            abstract: localeService.t(functionInfo.abstract),
            parameterRange: functionInfo.parameterRange,
            functionParameter: functionInfo.functionParameter.map((item) => ({
                name: localeService.t(item.name),
                detail: localeService.t(item.detail),
                example: item.example,
                require: item.require,
                repeat: item.repeat,
            })),
        }));
        this._formulaEngineService.registerDescription(...functionListLocale);
    }

    dispose(): void {
        this._localeService.localeChanged$.complete();
    }

    getDescriptions() {
        return this._formulaEngineService.getDescriptions();
    }
}
