import { Univer, LocaleType } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';

// TODO: @huwenzhao: change the following to new API

// univer
const univer = new Univer({
    locale: LocaleType.EN,
});

// create univer sheet instance
const universheet = univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

// base-render
univer.registerPlugin(RenderEngine);
// register plugins
univer.registerPlugin(SheetPlugin);
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
univer.registerPlugin(NumfmtPlugin);

// base-sheet

// FormulaPlugin.create(DEFAULT_FORMULA_DATA_DEMO).installTo(universheet);
// FindPlugin.create().installTo(universheet);
// universheet.installPlugin(new OperationPlugin());
// universheet.installPlugin(new ImportXlsxPlugin());
// universheet.installPlugin(new OverGridImagePlugin());
// universheet.installPlugin(new NumfmtPlugin());

// use for console test
declare global {
    interface Window {
        univer?: any;
    }
}

window.univer = univer;
