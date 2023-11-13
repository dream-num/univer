import { DocPlugin } from '@univerjs/base-docs';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { UIPlugin } from '@univerjs/base-ui';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { IUniverRPCMainThreadPluginConfig, UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { DebuggerPlugin } from '@univerjs/sheets-plugin-debugger';
// import { FindPlugin } from '@univerjs/sheets-plugin-find';
import { FormulaPlugin } from '@univerjs/sheets-plugin-formula';
// import { ImagePlugin } from '@univerjs/sheets-plugin-image';
// import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';
// import { NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';

import { locales } from './locales';

// univer
const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.EN_US,
    locales,
});

// core plugins
univer.registerPlugin(DocPlugin, {
    hasScroll: false,
});
// univer.registerPlugin(DocUIPlugin);
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
univer.registerPlugin(DebuggerPlugin);
// univer.registerPlugin(NumfmtPlugin);
// univer.registerPlugin(FindPlugin);
univer.registerPlugin(FormulaPlugin);
univer.registerPlugin(UniverRPCMainThreadPlugin, {
    workerURL: './worker.js',
} as IUniverRPCMainThreadPluginConfig);
// univer.registerPlugin(ImportXlsxPlugin);
// univer.registerPlugin(ImagePlugin);

// create univer sheet instance
univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
