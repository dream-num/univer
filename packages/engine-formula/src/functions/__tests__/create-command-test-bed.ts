import type { IWorkbookData } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Plugin, PluginType, Univer } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { CalculateController } from '../../controller/calculate.controller';
import { FormulaController } from '../../controller/formula.controller';
import { FormulaDataModel } from '../../models/formula-data.model';
import { ActiveDirtyManagerService, IActiveDirtyManagerService } from '../../services/active-dirty-manager.service';
import { FormulaService, IFormulaService } from '../../services/formula.service';
import { FormulaEngineService } from '../../services/formula-engine.service';

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
    locale: LocaleType.ZH_CN,
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
            injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
            injector.add([FormulaEngineService]);
            this._formulaDataModel = this._injector.createInstance(FormulaDataModel);

            injector.add([FormulaDataModel, { useValue: this._formulaDataModel }]);
            injector.add([FormulaController]);
            injector.add([IFormulaService, { useClass: FormulaService }]);
            injector.add([CalculateController]);

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
    logService.setLogLevel(LogLevel.SILENT); // change this to `true` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}
