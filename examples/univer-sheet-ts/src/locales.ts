import DocPluginZhCN from '@univerjs/base-docs/locale/zh-CN';
import SheetPluginZhCN from '@univerjs/base-sheets/locale/zh-CN';
import BaseUiZhCN from '@univerjs/base-ui/locale/zh-CN';
import SheetDebuggerPluginZhCN from '@univerjs/sheets-plugin-debugger/locale/zh-CN';
import FindPluginZhCN from '@univerjs/sheets-plugin-find/locale/zh-CN';
import ImportXlsxPluginZhCN from '@univerjs/sheets-plugin-import-xlsx/locale/zh-CN';
import NumberfmtPluginZhCN from '@univerjs/sheets-plugin-numfmt/locale/zh-CN';
import DocUIPluginZhCN from '@univerjs/ui-plugin-docs/locale/zh-CN';
import SheetUIPluginZhCN from '@univerjs/ui-plugin-sheets/locale/zh-CN';

export const locales = {
    zhCN: {
        ...DocPluginZhCN,
        ...SheetPluginZhCN,
        ...FindPluginZhCN,
        ...ImportXlsxPluginZhCN,
        ...NumberfmtPluginZhCN,
        ...DocUIPluginZhCN,
        ...SheetUIPluginZhCN,
        ...SheetDebuggerPluginZhCN,
        ...BaseUiZhCN,
    },
};
