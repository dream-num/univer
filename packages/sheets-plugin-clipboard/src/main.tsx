import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA, DEFAULT_WORKBOOK_DATA_DOWN } from '@univer/common-plugin-data';
import { SheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { RegisterPlugin } from '@univer/common-plugin-register';
import { ClipboardPlugin } from './ClipboardPlugin';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
    layout: 'auto',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
univerSheetUp.installPlugin(new RegisterPlugin());
univerSheetUp.installPlugin(new ClipboardPlugin());

const uiDefaultConfigDown = {
    container: 'universheet-demo-down',
    selections: {
        'sheet-0001': [
            {
                selection: {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 3,
                    endColumn: 3,
                },
                cell: {
                    row: 2,
                    column: 3,
                },
            },
        ],
    },
};

const univerSheetDown = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DOWN);
univerSheetDown.installPlugin(new RenderEngine());
univerSheetDown.installPlugin(new UniverComponentSheet());

univerSheetDown.installPlugin(new SheetPlugin(uiDefaultConfigDown));
