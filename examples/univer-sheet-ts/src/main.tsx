import { Univer, LocaleType } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { OperationPlugin } from '@univerjs/sheets-plugin-operation';
import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';
import { OverGridImagePlugin } from '@univerjs/sheets-plugin-image';
import { FindPlugin } from '@univerjs/sheets-plugin-find';
import { DEFAULT_FORMULA_DATA_DEMO, FormulaPlugin } from '@univerjs/sheets-plugin-formula';
import { NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';

// TODO: @huwenzhao: change the following to new API

// univer
const univer = new Univer({
    locale: LocaleType.EN,
});

// base-render
univer.registerPlugin(RenderEngine);
// register plugins
univer.registerPlugin(SheetPlugin);

// create univer sheet instance
const universheet = univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);
univer.addUniverSheet(universheet);
// base-sheet

// ui-plugin-sheets
univer.registerPlugin(SheetUIPlugin, {
    container: 'universheet',
    layout: {
        sheetContainerConfig: {
            infoBar: true,
            formulaBar: true,
            toolbar: true,
            sheetBar: true,
            countBar: true,
            rightMenu: true,
        },
    },
});

FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO).installTo(universheet);
FindPlugin.create().installTo(universheet);
universheet.installPlugin(new OperationPlugin());
universheet.installPlugin(new ImportXlsxPlugin());
universheet.installPlugin(new OverGridImagePlugin());
universheet.installPlugin(new NumfmtPlugin());

// use for console test
declare global {
    interface Window {
        univer?: any;
    }
}
window.univer = univer;
