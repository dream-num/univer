import type { CalculationMode } from '@univerjs/sheets-formula';
import { LocaleType, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import zhCN from '@univerjs/sheets/locale/zh-CN';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-filter/facade';
import '@univerjs/sheets-formula/facade';

export function createFormulaTestBed(options: {
    initialFormulaComputing?: CalculationMode;
    registerSheetsFilter?: boolean;
} = {}) {
    const univer = new Univer({
        locale: LocaleType.ZH_CN,
        locales: {
            [LocaleType.ZH_CN]: zhCN,
        },
    });

    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin, {
        initialFormulaComputing: options.initialFormulaComputing,
    });

    if (options.registerSheetsFilter) {
        univer.registerPlugin(UniverSheetsFilterPlugin);
    }

    const injector = univer.__getInjector();

    return {
        univer,
        get: injector.get.bind(injector),
        api: FUniver.newAPI(univer),
    };
}
