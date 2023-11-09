import { DocPlugin, RichTextEditingMutation } from '@univerjs/base-docs';
import { BaseFormulaEnginePlugin } from '@univerjs/base-formula-engine';
import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { UIPlugin } from '@univerjs/base-ui';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { IUniverRPCMainThreadPluginConfig, UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { FormulaPlugin } from '@univerjs/sheets-plugin-formula';
import { FormulaUIPlugin } from '@univerjs/sheets-plugin-formula-ui';
import { NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';

import { locales } from './locales';
import { DebuggerPlugin } from './sheets-plugin-debugger';

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
univer.registerPlugin(NumfmtPlugin);
univer.registerPlugin(BaseFormulaEnginePlugin);
univer.registerPlugin(FormulaPlugin, {
    notExecuteFormula: true,
});
univer.registerPlugin(FormulaUIPlugin);
univer.registerPlugin(UniverRPCMainThreadPlugin, {
    workerURL: './worker.js',
    unsyncMutations: new Set([RichTextEditingMutation.id]),
} as IUniverRPCMainThreadPluginConfig);

// create univer sheet instance
univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
