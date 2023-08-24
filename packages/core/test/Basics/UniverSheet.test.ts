/**
 * @jest-environment jsdom
 */
import { UniverSheet, Plugin, PluginType } from '../../src';

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

    // test('Test newInstance', () => {
    //     const sheet = univerSheet.getWorkBook().getSheetBySheetName('first sheet');
    //     expect(sheet && sheet.getName()).toEqual('first sheet');
    // });
    // test('Test installPlugin/uninstallPlugin/getWorkBook/get context', () => {
    //     class TestPlugin extends Plugin {
    //         static override type: PluginType.Sheet;

    //         constructor() {
    //             super('testPlugin');
    //         }

    //         override onMounted(): void {}

    //         override onDestroy(): void {}
    //     }

    //     // test installPlugin
    //     univerSheet.addPlugin(TestPlugin, {});
    // });
});
