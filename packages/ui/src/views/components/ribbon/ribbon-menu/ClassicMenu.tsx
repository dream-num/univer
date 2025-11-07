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

import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { useDependency } from '../../../../utils/di';

export function ClassicMenu({
    ribbon,
    activatedTab,
    onSelectTab,
}: {
    ribbon: IMenuSchema[];
    activatedTab: string;
    onSelectTab: (tab: IMenuSchema) => void;
}) {
    const localeService = useDependency(LocaleService);
    return (
        <div
            className={`
              univer-flex univer-w-full univer-items-center univer-justify-center univer-gap-1 univer-overflow-x-auto
              univer-rounded-md univer-bg-gray-50 univer-px-3 univer-py-1.5
              dark:univer-bg-gray-900
            `}
            role="tablist"
            aria-label={localeService.t('ribbon.menu')}
        >
            {ribbon.map((group) => {
                const isActive = activatedTab === group.key;
                return (
                    <button
                        key={group.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        title={localeService.t(group.key)}
                        onClick={() => onSelectTab(group)}
                        className={clsx(`
                          univer-focus:outline-none univer-focus:ring-2 univer-focus:ring-primary-500
                          dark:univer-focus:ring-primary-300
                          univer-flex univer-cursor-pointer univer-appearance-none univer-items-center univer-gap-1
                          univer-rounded-sm univer-border-none univer-px-2 univer-py-1 univer-text-sm
                          univer-transition-colors
                        `, isActive
                            ? `
                              univer-bg-primary-50 univer-font-semibold univer-text-primary-600 univer-shadow-sm
                              dark:univer-bg-primary-900 dark:univer-text-primary-300
                            `
                            : `
                              univer-hover:bg-gray-100
                              dark:univer-hover:bg-gray-700
                              univer-bg-transparent univer-text-gray-700
                              dark:univer-text-gray-200
                            `)}
                    >
                        {localeService.t(group.key)}
                    </button>
                );
            })}
        </div>
    );
}
