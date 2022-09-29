/**
 * @jest-environment jsdom
 */
import { UniverSheet } from '@univer/core';
import { StyleUniverSheet } from '@univer/style-universheet';
import { AlternatingColorsPlugin } from '../src';
// TODO 补充单元测试
test('Test Banding', () => {
    const univerSheet = UniverSheet.newInstance({
        locale: 'zh',
        creator: '',
        name: '',
        skin: 'default',
        timeZone: '',
        createdTime: '',
        modifiedTime: '',
        appVersion: '',
        lastModifiedBy: '',
        styles: {
            1: {
                color: 'blue',
                fontFamily: 'Arial',
                fontSize: 12,
                background: '#ff0000',
            },
            2: {
                color: 'green',
                fontSize: 14,
                background: '#0000ff',
            },
        },
        sheets: [
            {
                cellData: {
                    0: {
                        0: {
                            s: 1,
                            v: 1,
                            m: 1,
                        },
                        1: {
                            s: 2,
                            v: 2,
                            m: 2,
                        },
                    },
                },
            },
        ],
    });

    const uiDefaultConfigUp = {
        containerId: 'universheet-demo-up',
        // layout: 'auto',
        layout: {
            outerLeft: false,
            outerRight: true,
            innerLeft: false,
            innerRight: false,
            toolBar: true,
            toolBarConfig: {
                undoRedo: true,
                font: true,
            },
            contentSplit: true,
        },
    };
    univerSheet.installPlugin(new StyleUniverSheet(uiDefaultConfigUp));
    univerSheet.installPlugin(new AlternatingColorsPlugin());
});
