import type { IWorkbookData } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, Plugin, PluginType, Univer } from '@univerjs/core';
import { FormulaEngineService } from '@univerjs/engine-formula';
import { SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { ArrayFormulaDisplayController } from '../../../../../controllers/array-formula-display.controller';
import { CalculateController } from '../../../../../controllers/calculate.controller';
import { FormulaController } from '../../../../../controllers/formula.controller';
import { TriggerCalculationController } from '../../../../../controllers/trigger-calculation.controller';
import { UpdateFormulaController } from '../../../../../controllers/update-formula.controller';
import { FormulaDataModel } from '../../../../../models/formula-data.model';
import { FormulaService, IFormulaService } from '../../../../formula.service';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 1,
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                },
            },
        },
    },
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: [],
    styles: {},
};
export function createCommandTestBed(workbookConfig?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();

    let get: Injector['get'] | undefined;

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestSpyPlugin extends Plugin {
        static override type = PluginType.Sheet;

        private _formulaDataModel: FormulaDataModel | null = null;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');

            this._injector = _injector;
            get = this._injector.get.bind(this._injector);
        }

        override onStarting(injector: Injector): void {
            injector.add([FormulaEngineService]);
            this._formulaDataModel = this._injector.createInstance(FormulaDataModel);
            injector.add([SelectionManagerService]);
            injector.add([SheetInterceptorService]);
            injector.add([FormulaDataModel, { useValue: this._formulaDataModel }]);
            injector.add([FormulaController]);
            injector.add([IFormulaService, { useClass: FormulaService }]);
            injector.add([CalculateController]);
            injector.add([UpdateFormulaController]);
            injector.add([ArrayFormulaDisplayController]);
            injector.add([TriggerCalculationController]);

            dependencies?.forEach((d) => injector.add(d));
        }

        override onDestroy(): void {
            get = undefined;
        }

        override onReady(): void {
            this._formulaDataModel?.initFormulaData();
        }
    }

    univer.registerPlugin(TestSpyPlugin);
    const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA);

    if (get === undefined) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');

    const logService = get(ILogService);
    logService.toggleLogEnabled(false); // change this to `true` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}
