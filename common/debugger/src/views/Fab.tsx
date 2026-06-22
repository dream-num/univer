import type { IDropdownMenuProps } from '@univerjs/design';
import type { IUniverDebuggerConfig } from '../config/config';
import { IConfigService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx, DropdownMenu } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { DEBUGGER_PLUGIN_CONFIG_KEY } from '../config/config';
import { useCellContent } from './use-cell-content';
import { useDarkMode } from './use-dark-mode';
import { useDialog } from './use-dialog';
import { useDispose } from './use-dispose';
import { useEditable } from './use-editable';
import { useFloatingDom } from './use-floating-dom';
import { useLocale } from './use-locale';
import { useMessage } from './use-message';
import { useNotification } from './use-notification';
import { useRTL } from './use-rtl';
import { useSidebar } from './use-sidebar';
import { useSnapshot } from './use-snapshot';
import { useTheme } from './use-theme';
import { useUnits } from './use-units';
import { useUser } from './use-user';
import { useWatermark } from './use-watermark';

export function Fab() {
    const configService = useDependency(IConfigService);
    const configs = configService.getConfig<IUniverDebuggerConfig>(DEBUGGER_PLUGIN_CONFIG_KEY);
    const performanceMonitor = configs?.performanceMonitor;
    const fabEntryUnitType = configs?.fabEntryUnitType;

    const locale = useLocale();
    const rtl = useRTL();
    const darkMode = useDarkMode();
    const theme = useTheme();
    const watermark = useWatermark();
    const notification = useNotification();
    const message = useMessage();
    const dialog = useDialog();
    const sidebar = useSidebar();
    const floatingDom = useFloatingDom(fabEntryUnitType);
    const cellContent = useCellContent(fabEntryUnitType);
    const units = useUnits();
    const snapshot = useSnapshot();
    const editable = useEditable();
    const user = useUser();
    const dispose = useDispose();

    const globalItems = [locale, rtl, darkMode, theme];
    const lightweightItems = [
        ...globalItems,
        watermark,
    ];
    const commonDebugItems = [
        watermark,
        { type: 'separator' as const },
        notification,
        message,
        dialog,
        sidebar,
        { type: 'separator' as const },
        snapshot,
        editable,
        dispose,
    ];
    const sheetItems = [
        ...globalItems,
        watermark,
        { type: 'separator' as const },
        notification,
        message,
        dialog,
        sidebar,
        { type: 'separator' as const },
        floatingDom,
        cellContent,
        units,
        snapshot,
        editable,
        user,
        dispose,
    ];

    const items: IDropdownMenuProps['items'] = fabEntryUnitType === UniverInstanceType.UNIVER_BASE || fabEntryUnitType === UniverInstanceType.UNIVER_SLIDE
        ? lightweightItems
        : fabEntryUnitType === UniverInstanceType.UNIVER_DOC
            ? [...globalItems, ...commonDebugItems, floatingDom].filter(Boolean) as IDropdownMenuProps['items']
            : sheetItems.filter(Boolean) as IDropdownMenuProps['items'];

    return (
        <div
            data-u-comp="debugger-fab"
            className={`
              univer-fixed univer-bottom-12 univer-right-8 univer-z-[9999] univer-flex univer-select-none
              univer-flex-col univer-items-center univer-gap-1
            `}
        >
            <DropdownMenu align="end" items={items}>
                <button
                    className={clsx(`
                      univer-flex univer-size-9 univer-cursor-pointer univer-items-center univer-justify-center
                      univer-rounded-full univer-bg-white univer-text-base univer-text-gray-900 univer-shadow
                      univer-outline-none univer-transition-shadow
                      hover:univer-ring-1 hover:univer-ring-primary-400
                      dark:!univer-bg-gray-900 dark:!univer-text-gray-200
                    `, borderClassName)}
                    type="button"
                >
                    🏗️
                </button>
            </DropdownMenu>

            {performanceMonitor?.enabled && (
                <span data-u-comp="debugger-fps" className="univer-text-xs univer-text-gray-400" />
            )}
        </div>
    );
}
