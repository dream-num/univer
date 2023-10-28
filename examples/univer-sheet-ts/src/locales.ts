import { zhCN as DocPluginZh } from '@univerjs/base-docs';
import { zhCN as SheetPluginZh } from '@univerjs/base-sheets';
import { zhCN as BaseUiZh } from '@univerjs/base-ui';
import { zhCN as SheetDebuggerPluginZh } from '@univerjs/sheets-plugin-debugger';
import { zhCN as FindPluginZh } from '@univerjs/sheets-plugin-find';
import { zhCN as ImportXlsxPluginZh } from '@univerjs/sheets-plugin-import-xlsx';
import { zhCN as NumberfmtPluginZh } from '@univerjs/sheets-plugin-numfmt';
import { zhCN as DocUIPluginZh } from '@univerjs/ui-plugin-docs';
import { zhCN as SheetUIPluginZh } from '@univerjs/ui-plugin-sheets';

export const locales = {
    zhCN: {
        ...DocPluginZh,
        ...SheetPluginZh,
        ...FindPluginZh,
        ...ImportXlsxPluginZh,
        ...NumberfmtPluginZh,
        ...DocUIPluginZh,
        ...SheetUIPluginZh,
        ...SheetDebuggerPluginZh,
        ...BaseUiZh,
    },
};
