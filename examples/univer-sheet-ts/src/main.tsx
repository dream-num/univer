import { DocPlugin, zh as DocPluginZh } from '@univerjs/base-docs';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin, zh as SheetPluginZh } from '@univerjs/base-sheets';
import { UIPlugin, zh as UIPluginZh } from '@univerjs/base-ui';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { LocaleType, Univer } from '@univerjs/core';
import { FindPlugin, zh as FindPluginZh } from '@univerjs/sheets-plugin-find';
import { DEFAULT_FORMULA_DATA_DEMO, FormulaPlugin } from '@univerjs/sheets-plugin-formula';
import { ImagePlugin } from '@univerjs/sheets-plugin-image';
import { ImportXlsxPlugin, zh as ImportXlsxPluginZh } from '@univerjs/sheets-plugin-import-xlsx';
import { NumfmtPlugin, zh as NumberfmtPluginZh } from '@univerjs/sheets-plugin-numfmt';
import { DocUIPlugin, zh as DocUIPluginZh } from '@univerjs/ui-plugin-docs';
import { SheetUIPlugin, zh as SheetUIPluginZh } from '@univerjs/ui-plugin-sheets';

// univer
const univer = new Univer({
    locale: LocaleType.EN,
    locales: {
        zh: {
            ...DocPluginZh,
            ...SheetPluginZh,
            ...UIPluginZh,
            ...FindPluginZh,
            ...ImportXlsxPluginZh,
            ...NumberfmtPluginZh,
            ...DocUIPluginZh,
            ...SheetUIPluginZh,
        },
    },
});

// core plugins
univer.registerPlugin(DocPlugin, {
    standalone: false,
});
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

// feature plugins
univer.registerPlugin(NumfmtPlugin);
univer.registerPlugin(FindPlugin);
univer.registerPlugin(FormulaPlugin, DEFAULT_FORMULA_DATA_DEMO);
univer.registerPlugin(ImportXlsxPlugin);
univer.registerPlugin(ImagePlugin);

// create univer sheet instance
univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

// use for console test
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
