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

import { BooleanNumber, ILogService, IUniverInstanceService, type IWorkbookData, LocaleService, LocaleType, LogLevel, Plugin, Tools, Univer, UniverInstanceType, type Workbook } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { SheetsRenderService } from '@univerjs/sheets-ui';
import { SelectionManagerService } from '@univerjs/sheets';
import { enUS } from '../../locale';
import { SheetsSortService } from '../../services/sheets-sort.service';
import { SheetsSortController } from '../../controllers/sheets-sort.controller';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 1,
                    },
                    1: {
                        v: 20,
                    },
                    2: {
                        v: 100,
                    },
                },
                1: {
                    0: {
                        v: 2,
                    },
                    1: {
                        v: 19,
                    },
                    2: {
                        v: 100,
                    },
                },
                2: {
                    0: {
                        v: 3,
                    },
                    1: {
                        v: 18,
                    },
                    2: {
                        v: 100,
                    },
                },
                3: {
                    0: {
                        v: 4,
                    },
                    1: {
                        v: 17,
                    },
                    2: {
                        v: 200,
                    },
                },
                4: {
                    0: {
                        v: 5,
                    },
                    1: {
                        v: 16,
                    },
                    2: {
                        v: 200,
                    },
                },
                5: {
                    0: {
                        v: 6,
                    },
                    1: {
                        v: 15,
                    },
                    2: {
                        v: 200,
                    },
                },

            },
            columnData: {
                1: {
                    hd: BooleanNumber.FALSE,
                },
            },
            rowData: {
                1: {
                    hd: BooleanNumber.FALSE,
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: Workbook;
}

export function createCommandTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();

            this._injector = _injector;
        }

        override onStarting(injector: Injector): void {
            injector.add([SheetsSortService]);
            injector.add([SheetsSortController]);
            injector.add([SheetsRenderService, { useClass: mockSheetsRenderService }]);
            injector.add([SelectionManagerService, { useClass: mockSelectionManagerService as any }]);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(Tools.deepClone(workbookData || TEST_WORKBOOK_DATA_DEMO));

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    const localeService = injector.get(LocaleService);
    localeService.load({ enUS });

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
    };
}

class mockSheetsRenderService {
    registerSkeletonChangingMutations(id: string) {
    }
}

class mockSelectionManagerService {
    replace() {
    }
}
