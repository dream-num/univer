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

import type { Dependency, IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import {
    BooleanNumber,
    Disposable,
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    toDisposable,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import enUS from '@univerjs/sheets/locale/en-US';
import { ISidebarService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            cellData: {
                0: {
                    0: { v: 'A1' },
                },
            },
            hidden: BooleanNumber.FALSE,
        },
    },
};

class TestSidebarService extends Disposable {
    private _sidebarOptions = { visible: false } as any;
    readonly sidebarOptions$ = new BehaviorSubject(this._sidebarOptions);
    readonly scrollEvent$ = new Subject<Event>();
    private _container?: HTMLElement;
    private _width?: number;

    get visible(): boolean {
        return Boolean(this._sidebarOptions.visible);
    }

    get options() {
        return this._sidebarOptions;
    }

    get width(): number | undefined {
        return this._width;
    }

    setWidth(value: number): void {
        this._width = value;
    }

    open(params: any): IDisposable {
        this._sidebarOptions = {
            ...params,
            visible: true,
        };
        this.sidebarOptions$.next(this._sidebarOptions);
        params.onOpen?.();

        return toDisposable(() => this.close());
    }

    close(id?: string): void {
        if (id && this._sidebarOptions.id !== id) {
            return;
        }
        this._sidebarOptions = {
            ...this._sidebarOptions,
            visible: false,
        };
        this.sidebarOptions$.next(this._sidebarOptions);
        this._sidebarOptions.onClose?.();
    }

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element;
    }
}

function hasDependency(dependencies: Dependency[] | undefined, token: unknown): boolean {
    if (!dependencies) {
        return false;
    }

    for (const dependency of dependencies) {
        if (Array.isArray(dependency) && dependency[0] === token) {
            return true;
        }
    }

    return false;
}

export function createSheetsDrawingUiTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'sheets-drawing-ui-test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            if (!hasDependency(dependencies, IRenderManagerService)) {
                this._injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            }
            this._injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
            dependencies?.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverDrawingPlugin);
    univer.registerPlugin(UniverSheetsDrawingPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        Tools.deepClone(workbookData ?? TEST_WORKBOOK_DATA)
    );

    get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    get(ILogService).setLogLevel(LogLevel.SILENT);

    const localeService = get(LocaleService);
    localeService.load({ enUS });
    localeService.setLocale(LocaleType.EN_US);

    return {
        univer,
        injector,
        get,
        workbook,
        commandService: get(ICommandService),
        sidebarService: get(ISidebarService) as unknown as TestSidebarService,
        unitId: 'test',
        subUnitId: 'sheet1',
    };
}
