import DocsPluginZhCN from '@univerjs/docs/locale/zh-CN';
import sheetsPluginZhCN from '@univerjs/sheets/locale/zh-CN';
import BaseUiZhCN from '@univerjs/ui/locale/zh-CN';
import DesignZH from '@univerjs/design/locale/zh-CN';
import DocsUIPluginZhCN from '@univerjs/docs-ui/locale/zh-CN';
import SheetsUIPluginZhCN from '@univerjs/sheets-ui/locale/zh-CN';

import SheetDebuggerPluginZhCN from './sheets-plugin-debugger/locale/zh-CN';

export const locales = {
    zhCN: {
        ...DocsPluginZhCN,
        ...sheetsPluginZhCN,
        ...DocsUIPluginZhCN,
        ...SheetsUIPluginZhCN,
        ...SheetDebuggerPluginZhCN,
        ...BaseUiZhCN,
        ...DesignZH,
    },
};
