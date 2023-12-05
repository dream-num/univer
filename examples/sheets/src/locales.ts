import DocsPluginZhCN from '@univerjs/docs/locale/zh-CN';
import SheetPluginZhCN from '@univerjs/sheets/locale/zh-CN';
import BaseUiZhCN from '@univerjs/ui/locale/zh-CN';
import DeisgnZH from '@univerjs/design/locale/zh-CN';
import DocsUIPluginZhCN from '@univerjs/docs-ui/locale/zh-CN';
import SheetsUIPluginZhCN from '@univerjs/sheets-ui/locale/zh-CN';

import SheetDebuggerPluginZhCN from './sheets-plugin-debugger/locale/zh-CN';

export const locales = {
    zhCN: {
        ...DocsPluginZhCN,
        ...SheetPluginZhCN,
        ...DocsUIPluginZhCN,
        ...SheetsUIPluginZhCN,
        ...SheetDebuggerPluginZhCN,
        ...BaseUiZhCN,
        ...DeisgnZH,
    },
};
