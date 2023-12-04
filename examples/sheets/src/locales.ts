import DocPluginZhCN from '@univerjs/docs/locale/zh-CN';
import SheetPluginZhCN from '@univerjs/sheets/locale/zh-CN';
import BaseUiZhCN from '@univerjs/ui/locale/zh-CN';
import DeisgnZH from '@univerjs/design/locale/zh-CN';
import DocUIPluginZhCN from '@univerjs/docs-ui/locale/zh-CN';
import SheetUIPluginZhCN from '@univerjs/sheets-ui/locale/zh-CN';

import SheetDebuggerPluginZhCN from './sheets-plugin-debugger/locale/zh-CN';

export const locales = {
    zhCN: {
        ...DocPluginZhCN,
        ...SheetPluginZhCN,
        ...DocUIPluginZhCN,
        ...SheetUIPluginZhCN,
        ...SheetDebuggerPluginZhCN,
        ...BaseUiZhCN,
        ...DeisgnZH,
    },
};
