/**
 * @jest-environment jsdom
 */
import { SheetContext, IOCContainer, UniverSheet, Plugin } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

describe('UniverSheet', () => {
    let univerSheet: UniverSheet;
    beforeAll(async () => {
        univerSheet = UniverSheet.newInstance({
            id: 'workbook-01',
            sheets: {
                'sheet-01': {
                    name: 'first sheet',
                    id: 'sheet-01',
                },
            },
        });
    });
    afterAll(async () => {});

    test('Test newInstance', () => {
        let sheet = univerSheet.getWorkBook().getSheetBySheetName('first sheet');
        expect(sheet && sheet.getName()).toEqual('first sheet');
    });
    test('Test installPlugin/uninstallPlugin/getWorkBook/get context', () => {
        class TestPlugin extends Plugin {
            context: SheetContext;

            constructor() {
                super('testPlugin');
            }

            initialize(context: SheetContext): void {
                this.context = context;
            }

            onMapping(IOC: IOCContainer): void {}

            onMounted(ctx: SheetContext): void {
                this.initialize(ctx);
            }

            onDestroy(): void {}
        }

        // test installPlugin
        univerSheet.installPlugin(new TestPlugin());

        // test getWorkBook
        let plugin = univerSheet
            .getWorkBook()
            .getContext()
            .getPluginManager()
            .getPluginByName<TestPlugin>('testPlugin');

        plugin?.getPluginByName<TestPlugin>('testPlugin');
        expect(plugin && plugin.getPluginName()).toEqual('testPlugin');

        // test uninstallPlugin
        univerSheet.uninstallPlugin('testPlugin');

        let uninstalledPlugin = univerSheet
            .getWorkBook()
            .getContext()
            .getPluginManager()
            .getPluginByName<TestPlugin>('testPlugin');
        expect(uninstalledPlugin).toEqual(undefined);
    });

    test('Test SheetContext', () => {
        // test get context
        let context = univerSheet.context;

        let undoManager = context.getUndoManager();
        let observerManager = context.getObserverManager();
        let locale = context.getLocale();
        let pluginManager = context.getPluginManager();
        let hooksManager = context.getHooksManager();

        expect(undoManager).not.toBeNull();
        expect(observerManager).not.toBeNull();
        expect(locale).not.toBeNull();
        expect(pluginManager).not.toBeNull();
        expect(hooksManager).not.toBeNull();
    });
});
