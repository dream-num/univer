import { UniverSheet, UniverDoc, UniverSlide } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { SheetPlugin } from '@univer/base-sheets';
import { DocPlugin } from '@univer/base-docs';
import { SlidePlugin } from '@univer/base-slides';
import {
    DEFAULT_FORMULA_DATA,
    FormulaPlugin,
} from '@univer/sheets-plugin-formula';
import { NumfmtPlugin } from '@univer/sheets-plugin-numfmt';
import {
    DEFAULT_WORKBOOK_DATA,
    DEFAULT_WORKBOOK_DATA_DOWN,
} from '@univer/common-plugin-data';
import { ClipboardPlugin } from '@univer/sheets-plugin-clipboard';
import { BaseComponentPlugin } from '@univer/base-component';
import { ImportXlsxPlugin } from '@univer/sheets-plugin-import-xlsx';

const uiDefaultConfigUp = {
    container: 'universheet-up',
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
univerSheetUp.installPlugin(new BaseComponentPlugin());
univerSheetUp.installPlugin(new NumfmtPlugin());
FormulaPlugin.create(DEFAULT_FORMULA_DATA).installTo(univerSheetUp);

univerSheetUp.installPlugin(new ClipboardPlugin());
univerSheetUp.installPlugin(new ImportXlsxPlugin());

const univerSheetDown = UniverSheet.newInstance();
univerSheetDown.installPlugin(new RenderEngine());
univerSheetDown.installPlugin(new UniverComponentSheet());

univerSheetDown.installPlugin(
    new SheetPlugin({
        container: 'universheet-down',
    })
);
univerSheetDown.installPlugin(new BaseComponentPlugin());
univerSheetDown.installPlugin(new NumfmtPlugin());
FormulaPlugin.create().installTo(univerSheetDown);

univerSheetDown.installPlugin(new ClipboardPlugin());

// doc

const docPluginConfig = {
    container: 'univerdoc',
};
const univerDoc = UniverDoc.newInstance();

univerDoc.installPlugin(new RenderEngine());
univerDoc.installPlugin(new UniverComponentSheet());

univerDoc.installPlugin(new DocPlugin(docPluginConfig));
univerDoc.installPlugin(new BaseComponentPlugin());

// SlidePlugin

const slidePluginConfig = {
    container: 'universlide',
};

const univerSlide = UniverSlide.newInstance();

univerSlide.installPlugin(new RenderEngine());
univerSlide.installPlugin(new UniverComponentSheet());

univerSlide.installPlugin(new SlidePlugin(slidePluginConfig));
univerSlide.installPlugin(new BaseComponentPlugin());
