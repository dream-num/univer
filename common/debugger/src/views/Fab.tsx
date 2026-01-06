/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDropdownMenuProps } from '@univerjs/design';
import type { IUniverDebuggerConfig } from '../controllers/config.schema';
import { IConfigService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx, DropdownMenu } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { DEBUGGER_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';
import { useCellContent } from './use-cell-content';
import { useDarkMode } from './use-dark-mode';
import { useDialog } from './use-dialog';
import { useDispose } from './use-dispose';
import { useEditable } from './use-editable';
import { useFloatingDom } from './use-floating-dom';
import { useLocale } from './use-locale';
import { useMessage } from './use-message';
import { useNotification } from './use-notification';
import { useSidebar } from './use-sidebar';
import { useSnapshot } from './use-snapshot';
import { useTheme } from './use-theme';
import { useUnits } from './use-units';
import { useUser } from './use-user';
import { useWatermark } from './use-watermark';

export function Fab() {
    const configService = useDependency(IConfigService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitType = univerInstanceService.getFocusedUnit()?.type;

    if (!unitType) return null;

    const items: IDropdownMenuProps['items'] = [
        useLocale(),
        useDarkMode(),
        useTheme(),
        useWatermark(),
        { type: 'separator' },
        useNotification(),
        useMessage(),
        useDialog(),
        useSidebar(),
        { type: 'separator' },
        unitType === UniverInstanceType.UNIVER_SHEET && useFloatingDom(),
        unitType === UniverInstanceType.UNIVER_SHEET && useCellContent(),
        unitType === UniverInstanceType.UNIVER_SHEET && useUnits(),
        useSnapshot(),
        useEditable(),
        unitType === UniverInstanceType.UNIVER_SHEET && useUser(),
        useDispose(),
    ].filter((item) => item !== null) as IDropdownMenuProps['items'];

    const configs = configService.getConfig<IUniverDebuggerConfig>(DEBUGGER_PLUGIN_CONFIG_KEY);
    const performanceMonitor = configs?.performanceMonitor;

    return (
        <div
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
