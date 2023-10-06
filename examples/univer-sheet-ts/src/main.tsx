import { DocPlugin } from '@univerjs/base-docs';
import { DOCS_EDITOR_UNIT_ID_KEY, RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { greenTheme, UIPlugin } from '@univerjs/base-ui';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { LocaleType, Univer } from '@univerjs/core';
// import { FindPlugin } from '@univerjs/sheets-plugin-find';
// import { DEFAULT_FORMULA_DATA_DEMO, FormulaPlugin } from '@univerjs/sheets-plugin-formula';
// import { ImagePlugin } from '@univerjs/sheets-plugin-image';
// import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';
// import { NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';
import { DocUIPlugin } from '@univerjs/ui-plugin-docs';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';

import { locales } from './locales';

// univer
const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.EN,
    locales,
});

const DOCS_EDITOR_SNAPSHOT = {
    id: DOCS_EDITOR_UNIT_ID_KEY,
    documentStyle: {},
};

// core plugins
univer.registerPlugin(DocPlugin);
univer.registerPlugin(DocUIPlugin);
univer.registerPlugin(RenderEngine);
univer.registerPlugin(UIPlugin, {
    container: 'univer-container',
    header: true,
    toolbar: true,
    footer: true,
});
univer.registerPlugin(SheetPlugin);
univer.registerPlugin(SheetUIPlugin);

// sheet feature plugins
// univer.registerPlugin(NumfmtPlugin);
// univer.registerPlugin(FindPlugin);
// univer.registerPlugin(FormulaPlugin, DEFAULT_FORMULA_DATA_DEMO);
// univer.registerPlugin(ImportXlsxPlugin);
// univer.registerPlugin(ImagePlugin);

// create univer doc editor instance
univer.createUniverDoc(DOCS_EDITOR_SNAPSHOT);

// create univer sheet instance
univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

// use for console test
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
