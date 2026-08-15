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

export function RibbonGridMenu({
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
            data-testid="ribbon-grid-menu"
            data-u-comp="ribbon-grid-menu"
            className="
              univer-flex univer-h-full univer-items-end univer-justify-start univer-overflow-x-auto univer-bg-gray-50
              univer-px-2
              dark:!univer-bg-gray-900
            "
            role="tablist"
        >
            {ribbon.map((group) => {
                const isActive = activatedTab === group.key;
                const title = localeService.t(group.title || group.key);
                return (
                    <button
                        key={group.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        title={title}
                        onClick={() => onSelectTab(group)}
                        className={clsx(`
                          univer-relative univer-flex univer-h-9 univer-cursor-pointer univer-items-center
                          univer-whitespace-nowrap univer-border-0 univer-border-b-[3px] univer-bg-transparent
                          univer-px-3 univer-text-base univer-font-semibold univer-text-gray-700
                          univer-transition-colors
                          hover:univer-text-gray-900
                          focus-visible:univer-outline-none focus-visible:univer-ring-2 focus-visible:univer-ring-inset
                          focus-visible:univer-ring-primary-500
                          dark:!univer-text-gray-200
                          dark:hover:!univer-text-gray-0
                        `, isActive
                            ? `
                              univer-border-primary-600 univer-text-primary-700
                              dark:!univer-text-primary-300
                            `
                            : 'univer-border-transparent')}
                    >
                        {title}
                    </button>
                );
            })}
        </div>
    );
}
