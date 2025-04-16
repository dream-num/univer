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

/* eslint-disable ts/no-explicit-any */

import type { Dependency, IDisposable, IWorkbookData } from '@univerjs/core';
import { DisposableCollection, ILogService, Inject, Injector, IUniverInstanceService, LocaleService, LocaleType, LogLevel, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { CalculateFormulaService, DefinedNamesService, FormulaCurrentConfigService, FormulaDataModel, FormulaRuntimeService, ICalculateFormulaService, IDefinedNamesService, IFormulaCurrentConfigService, IFormulaRuntimeService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';

import {
    BrowserClipboardService,
    DesktopMessageService,
    IClipboardInterfaceService,
    IMessageService,
    INotificationService,
    IPlatformService,
    IUIPartsService,
    UIPartsService,
} from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { SheetClipboardController } from '../../../controllers/clipboard/clipboard.controller';
import { IMarkSelectionService } from '../../mark-selection/mark-selection.service';
import { ISheetSelectionRenderService } from '../../selection/base-selection-render.service';
import { SheetSelectionRenderService } from '../../selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { ISheetClipboardService, SheetClipboardService } from '../clipboard.service';

const cellData = {
    0: {
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
        10: {
            v: '456',
            s: '3UpAbI',
        },
        11: {
            s: '3UpAbI',
        },
    },
    1: {
        5: {
            v: ' ',
            s: 'u5otPe',
        },
        6: {
            v: ' ',
            s: 'u5otPe',
        },
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
    },
    2: {
        8: {
            v: ' ',
            s: 'u5otPe',
        },
    },
    3: {
        5: {
            v: ' ',
            s: 'u5otPe',
        },
        6: {
            v: ' ',
            s: 'u5otPe',
        },
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
        10: {
            s: '3UpAbI',
            v: '456',
        },
        11: {
            s: '3UpAbI',
        },
        12: {
            s: '3UpAbI',
        },
    },
    5: {
        5: {
            v: ' ',
            s: 'u5otPe',
        },
        6: {
            v: ' ',
            s: 'u5otPe',
        },
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
    },
    6: {
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
        10: {
            v: '456',
            s: 'hw-erj',
        },
        11: {
            s: 'hw-erj',
        },
    },
    7: {
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
    },
    8: {
        5: {
            v: ' ',
            s: 'u5otPe',
        },
        6: {
            v: ' ',
            s: 'u5otPe',
        },
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
        11: {
            v: '456',
            s: '_aRLOe',
        },
        12: {
            s: '_aRLOe',
        },
    },
    9: {
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
        11: {
            s: '_aRLOe',
        },
        12: {
            s: '_aRLOe',
        },
    },
    10: {
        5: {
            v: ' ',
            s: 'u5otPe',
        },
        6: {
            v: ' ',
            s: 'u5otPe',
        },
        7: {
            v: ' ',
            s: 'u5otPe',
        },
        8: {
            v: ' ',
            s: 'u5otPe',
        },
    },
    11: {
        8: {
            v: ' ',
            s: 'u5otPe',
        },
        10: {
            v: '456',
            s: 'Mtn4vb',
        },
        11: {
            s: 'Mtn4vb',
        },
        12: {
            s: 'Mtn4vb',
        },
    },
    12: {
        8: {
            v: ' ',
            s: 'u5otPe',
        },
    },
    13: {
        11: {
            v: '456',
            s: '3UpAbI',
        },
        12: {
            s: '3UpAbI',
        },
    },
    14: {
        11: {
            s: '3UpAbI',
        },
        12: {
            s: '3UpAbI',
        },
    },
    16: {
        10: {
            v: '456',
            s: '3UpAbI',
        },
        11: {
            s: '3UpAbI',
        },
    },
    17: {
        11: {
            v: '456',
            s: '3UpAbI',
        },
        12: {
            s: '3UpAbI',
        },
    },
    18: {
        11: {
            s: '3UpAbI',
        },
        12: {
            s: '3UpAbI',
        },
    },
    21: {
        10: {
            v: '456',
            s: '3UpAbI',
        },
        11: {
            s: '3UpAbI',
        },
    },
    22: {
        10: {
            s: '3UpAbI',
        },
        11: {
            s: '3UpAbI',
        },
    },
    23: {
        11: {
            v: '456',
            s: '3UpAbI',
        },
        12: {
            s: '3UpAbI',
        },
    },
    24: {
        0: {
            v: 'A25',
            s: '3UpAbI',
        },
        1: {
            v: 'B25',
            s: '3UpAbI',
        },
        2: {
            v: 'C25',
            s: '3UpAbI',
        },
    },
};

const styles = {
    u5otPe: {
        bd: {},
    },
    '3UpAbI': {
        bg: {
            rgb: '#ccc',
        },
    },
    'hw-erj': {
        bg: {
            rgb: '#ccc',
        },
        ht: 2,
    },
    _aRLOe: {
        bg: {
            rgb: '#ccc',
        },
        ht: 2,
        vt: 2,
    },
    Mtn4vb: {
        bg: {
            rgb: '#ccc',
        },
        ht: 3,
    },
};

const mergeData = [
    {
        startRow: 16,
        endRow: 16,
        startColumn: 10,
        endColumn: 11,
    },
    {
        startRow: 21,
        endRow: 22,
        startColumn: 10,
        endColumn: 11,
    },
    // check
    {
        startRow: 0,
        startColumn: 5,
        endRow: 0,
        endColumn: 6,
    },
    // check
    {
        startRow: 2,
        startColumn: 5,
        endRow: 2,
        endColumn: 7,
    },
    // check
    {
        startRow: 4,
        startColumn: 5,
        endRow: 4,
        endColumn: 8,
    },
    // check
    {
        startRow: 6,
        startColumn: 5,
        endRow: 7,
        endColumn: 6,
    },
    // check
    {
        startRow: 9,
        startColumn: 5,
        endRow: 9,
        endColumn: 6,
    },
    // check
    {
        startRow: 11,
        startColumn: 5,
        endRow: 12,
        endColumn: 6,
    },
    // check
    {
        startRow: 11,
        startColumn: 7,
        endRow: 12,
        endColumn: 7,
    },
    // check
    {
        startRow: 0,
        startColumn: 10,
        endRow: 0,
        endColumn: 11,
    },
    // check
    {
        startRow: 3,
        startColumn: 10,
        endRow: 3,
        endColumn: 12,
    },
    // check
    {
        startRow: 6,
        startColumn: 10,
        endRow: 6,
        endColumn: 11,
    },
    // check
    {
        startRow: 8,
        startColumn: 11,
        endRow: 9,
        endColumn: 12,
    },
    // check
    {
        startRow: 11,
        startColumn: 10,
        endRow: 11,
        endColumn: 12,
    },
    // check
    {
        startRow: 13,
        startColumn: 11,
        endRow: 14,
        endColumn: 12,
    },
    {
        startRow: 17,
        startColumn: 11,
        endRow: 18,
        endColumn: 12,
    },
    {
        startRow: 23,
        startColumn: 11,
        endRow: 23,
        endColumn: 12,
    },
];

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData,
            mergeData,
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles,
};

export class testMarkSelectionService {
    addShape(): string | null {
        return null;
    }

    addShapeWithNoFresh(): string | null {
        return null;
    }

    removeShape(id: string): void {
        // empty
    }

    removeAllShapes(): void {
        // empty
    }

    refreshShapes(): void {
        // empty
    }

    getShapeMap(): Map<string, any> {
        return new Map();
    }
}

export class testNotificationService {
    show(): IDisposable {
        return {
            dispose: () => { /* empty */ },
        };
    }
}

export class testPlatformService {
    isWindows: boolean = false;
    isMac: boolean = true;
    isLinux: boolean = false;
}

// eslint-disable-next-line max-lines-per-function
export function clipboardTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([IUIPartsService, { useClass: UIPartsService }]);
            injector.add([SheetsSelectionsService]);
            injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }]);
            injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
            injector.add([IMessageService, { useClass: DesktopMessageService, lazy: true }]);
            injector.add([
                IMarkSelectionService,
                {
                    useClass: testMarkSelectionService,
                },
            ]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }]);
            injector.add([INotificationService, { useClass: testNotificationService }]);
            injector.add([IPlatformService, { useClass: testPlatformService }]);

            // Because SheetClipboardController is initialized in the rendered life cycle, here we need to initialize it manually
            const sheetClipboardController = injector.createInstance(SheetClipboardController);

            injector.add([SheetClipboardController, { useValue: sheetClipboardController }]);
            injector.add([SheetInterceptorService]);
            injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([SheetSkeletonService]);

            dependencies?.forEach((d) => injector.add(d));

            const localeService = injector.get(LocaleService);
            localeService.load({});

            injector.get(IUIPartsService);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(workbookData || TEST_WORKBOOK_DATA_DEMO);

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    // NOTE: This is pretty hack for the test. But with these hacks we can avoid to create
    // real canvas-environment in univerjs/sheets-ui. If some we have to do that, this hack could be removed.
    const mockSheetSkService = new SheetSkeletonService(injector);
    const fakeSheetSkeletonManagerService = new SheetSkeletonManagerService({
        unit: sheet,
        unitId: 'test',
        type: UniverInstanceType.UNIVER_SHEET,
        engine: null as any,
        scene: null as any,
        mainComponent: null as any,
        components: null as any,
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        activate: () => {},
        deactivate: () => {},
    }, injector, injector.get(SheetSkeletonService));

    injector.add([SheetSkeletonManagerService, { useValue: fakeSheetSkeletonManagerService }]);
    injector.get(IRenderManagerService).addRender('test', {
        type: UniverInstanceType.UNIVER_SHEET,
        unitId: 'test',
        engine: new DisposableCollection() as any,
        scene: new DisposableCollection() as any,
        mainComponent: null as any,
        components: new Map(),
        isMainScene: true,
        with: injector.get.bind(injector),
        activated$: new BehaviorSubject(true),
        activate: () => {},
        deactivate: () => {},
    });

    return {
        univer,
        get,
        sheet,
    };
}
