import DocPluginZhCN from '@univerjs/docs/locale/zh-CN';
import BaseUiZhCN from '@univerjs/ui/locale/zh-CN';
import DeisgnZH from '@univerjs/design/locale/zh-CN';
import DocUIPluginZhCN from '@univerjs/docs-ui/locale/zh-CN';

export const locales = {
    zhCN: {
        ...DocPluginZhCN,
        ...DocUIPluginZhCN,
        ...BaseUiZhCN,
        ...DeisgnZH,
    },
};
