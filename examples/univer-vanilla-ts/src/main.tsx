import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { SheetPlugin } from '@univer/base-sheets';
import {
    DEFAULT_FORMULA_DATA,
    FormulaPlugin,
} from '@univer/sheets-plugin-formula';
import { NumfmtPlugin } from '@univer/sheets-plugin-numfmt';
import {
    DEFAULT_WORKBOOK_DATA,
    DEFAULT_WORKBOOK_DATA_DOWN,
} from '@univer/common-plugin-data';
import { RegisterPlugin } from '@univer/common-plugin-register';
import { ClipboardPlugin } from '@univer/sheets-plugin-clipboard';
import { ClipboardOfficePlugin } from '@univer/sheets-plugin-clipboard-office';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
    layout: {
        innerRight: false,
        outerLeft: false,
        toolBarConfig: {
            paintFormat: false,
            currencyFormat: false,
            percentageFormat: false,
            numberDecrease: false,
            numberIncrease: false,
            moreFormats: false,
        },
    },

    selections: {
        'sheet-01': [
            {
                selection: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 3,
                    endColumn: 3,
                },
                cell: {
                    row: 0,
                    column: 3,
                },
            },
        ],
    },
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));

univerSheetUp.installPlugin(new NumfmtPlugin());
FormulaPlugin.create(DEFAULT_FORMULA_DATA).installTo(univerSheetUp);

univerSheetUp.installPlugin(new RegisterPlugin());
univerSheetUp.installPlugin(new ClipboardPlugin());
univerSheetUp.installPlugin(new ClipboardOfficePlugin());



const univerSheetDown = UniverSheet.newInstance();
univerSheetDown.installPlugin(new RenderEngine());
univerSheetDown.installPlugin(new UniverComponentSheet());

univerSheetDown.installPlugin(new SheetPlugin());
univerSheetDown.installPlugin(new NumfmtPlugin());
FormulaPlugin.create().installTo(univerSheetDown);

univerSheetDown.installPlugin(new RegisterPlugin());
univerSheetDown.installPlugin(new ClipboardPlugin());
univerSheetDown.installPlugin(new ClipboardOfficePlugin());
