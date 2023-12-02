import DocPluginZhCN from '@univerjs/base-docs/locale/zh-CN';
import SheetPluginZhCN from '@univerjs/base-sheets/locale/zh-CN';
import BaseUiZhCN from '@univerjs/base-ui/locale/zh-CN';
import DeisgnZH from '@univerjs/design/locale/zh-CN';
import DocUIPluginZhCN from '@univerjs/ui-plugin-docs/locale/zh-CN';
import SheetUIPluginZhCN from '@univerjs/ui-plugin-sheets/locale/zh-CN';

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
