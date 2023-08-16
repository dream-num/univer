import { Univer, LocaleType } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { DEFAULT_FORMULA_DATA_DEMO, FormulaPlugin } from '@univerjs/sheets-plugin-formula';
import { NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';
import { FindPlugin } from '@univerjs/sheets-plugin-find';
import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';
import { OperationPlugin } from '@univerjs/sheets-plugin-operation';
import { ImagePlugin } from '@univerjs/sheets-plugin-image';

// TODO: @huwenzhao: change the following to new API

// univer
const univer = new Univer({
    locale: LocaleType.EN,
});

// create univer sheet instance
univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

// register plugins
univer.registerPlugin(RenderEngine);
univer.registerPlugin(SheetPlugin);
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
univer.registerPlugin(FindPlugin);
univer.registerPlugin(FormulaPlugin, DEFAULT_FORMULA_DATA_DEMO);
univer.registerPlugin(ImportXlsxPlugin);
univer.registerPlugin(ImagePlugin);
univer.registerPlugin(OperationPlugin);
// universheet.installPlugin(new OverGridImagePlugin());

// use for console test
declare global {
    interface Window {
        univer?: any;
    }
}

window.univer = univer;
