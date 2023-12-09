import type { IWorkbookData } from '@univerjs/core';
import { LocaleType, Plugin, PluginType, Univer } from '@univerjs/core';
import { SelectionManagerService, SheetInterceptorService, SheetPermissionService } from '@univerjs/sheets';
import { DesktopMenuService, DesktopShortcutService, IMenuService, IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
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

export function createMenuTestBed() {
    const univer = new Univer();

    let get: Injector['get'] | null = null;

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestPlugin extends Plugin {
        protected override _injector: Injector;

        static override type = PluginType.Sheet;

        constructor(@Inject(Injector) _injector: Injector) {
            super('test-plugin');

            this._injector = _injector;
            get = this._injector.get.bind(this._injector);
        }

        override onStarting(injector: Injector): void {
            injector.add([SelectionManagerService]);
            injector.add([IShortcutService, { useClass: DesktopShortcutService }]);
            injector.add([IMenuService, { useClass: DesktopMenuService }]);
            injector.add([SheetPermissionService]);
            injector.add([SheetInterceptorService]);
        }

        override onDestroy(): void {
            get = null;
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(TEST_WORKBOOK_DATA_DEMO);

    if (!get) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    return {
        univer,
        get,
        sheet,
    };
}
