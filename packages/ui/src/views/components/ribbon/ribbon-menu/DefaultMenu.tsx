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
import { borderClassName, clsx, HoverCard } from '@univerjs/design';
import { DatabaseIcon, EyeIcon, FunctionIcon, HomeIcon, InsertIcon, MoreDownIcon, MoreFunctionIcon } from '@univerjs/icons';
import { useState } from 'react';
import { RibbonPosition } from '../../../../services/menu/types';
import { useDependency } from '../../../../utils/di';

const iconMap = {
    [RibbonPosition.START]: HomeIcon,
    [RibbonPosition.INSERT]: InsertIcon,
    [RibbonPosition.FORMULAS]: FunctionIcon,
    [RibbonPosition.DATA]: DatabaseIcon,
    [RibbonPosition.VIEW]: EyeIcon,
    [RibbonPosition.OTHERS]: MoreFunctionIcon,
};

export function DefaultMenu({
    ribbon,
    activatedTab,
    onSelectTab,
}: {
    ribbon: IMenuSchema[];
    activatedTab: string;
    onSelectTab: (tab: IMenuSchema) => void;
}) {
    const localeService = useDependency(LocaleService);

    const [groupSelectorVisible, setGroupSelectorVisible] = useState(false);

    function handleSelectTab(tab: IMenuSchema) {
        onSelectTab(tab);
        setGroupSelectorVisible(false);
    }

    return (
        <HoverCard
            className="univer-max-w-96 !univer-rounded-xl"
            align="start"
            open={groupSelectorVisible}
            overlay={(
                <div className="univer-grid univer-gap-1 univer-px-2 univer-py-1">
                    {ribbon.map((group) => {
                        const Icon = iconMap[group.key as RibbonPosition];

                        return (
                            <a
                                key={group.key}
                                data-u-comp="ribbon-group-btn"
                                className={`
                                  univer-box-border univer-flex univer-cursor-pointer univer-items-center univer-gap-2.5
                                  univer-rounded-lg univer-px-2 univer-py-1.5
                                  hover:univer-bg-gray-100
                                  dark:hover:!univer-bg-gray-700
                                `}
                                role="button"
                                onClick={() => handleSelectTab(group)}
                            >
                                <span
                                    className={clsx(`
                                      univer-box-border univer-flex univer-size-9 univer-flex-shrink-0
                                      univer-items-center univer-justify-center univer-rounded-lg
                                    `, borderClassName)}
                                >
                                    <Icon
                                        className={`
                                          univer-text-gray-500
                                          dark:!univer-text-gray-300
                                        `}
                                    />
                                </span>
                                <span className="univer-flex univer-flex-col">
                                    <strong
                                        className={`
                                          univer-text-sm univer-font-semibold univer-text-gray-800
                                          dark:!univer-text-gray-200
                                        `}
                                    >
                                        {localeService.t(group.key)}
                                    </strong>
                                    <span className="univer-text-xs univer-text-gray-400">
                                        {localeService.t(`${group.key}Desc`)}
                                    </span>
                                </span>
                            </a>
                        );
                    })}
                </div>
            )}
            onOpenChange={setGroupSelectorVisible}
        >
            <a
                className={`
                  univer-mr-2 univer-flex univer-h-7 univer-cursor-pointer univer-items-center univer-gap-1.5
                  univer-whitespace-nowrap !univer-rounded-full univer-bg-gray-700 univer-pl-3 univer-pr-2
                  univer-text-sm univer-text-white
                  dark:!univer-bg-gray-200 dark:!univer-text-gray-800
                `}
                onClick={() => setGroupSelectorVisible(true)}
            >
                {localeService.t(activatedTab)}
                <MoreDownIcon
                    className={`
                      univer-text-gray-200
                      dark:!univer-text-gray-500
                    `}
                />
            </a>
        </HoverCard>
    );
}
