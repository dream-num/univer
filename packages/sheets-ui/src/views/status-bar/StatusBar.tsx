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

import type { Nullable } from '@univerjs/core';
import type { IFunctionNames } from '@univerjs/engine-formula';
import type { IStatusBarServiceStatus } from '../../services/status-bar.service';
import type { IStatisticItem } from './CopyableStatisticItem';
import { LocaleService } from '@univerjs/core';
import { clsx, Dropdown, Tooltip } from '@univerjs/design';
import { FUNCTION_NAMES_MATH } from '@univerjs/engine-formula';
import { CheckMarkIcon, MoreDownIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

import { IStatusBarService } from '../../services/status-bar.service';
import { formatNumber, functionDisplayNames } from './CopyableStatisticItem';

export const StatusBar = () => {
    const localeService = useDependency(LocaleService);
    const statusBarService = useDependency(IStatusBarService);
    const [selectedFunction, setSelectedFunction] = useState<IFunctionNames>(FUNCTION_NAMES_MATH.SUM);
    const [open, setOpen] = useState(false);
    const [statistics, setStatistics] = useState<IStatisticItem[]>(() =>
        statusBarService.getFunctions().map((item) => ({
            name: item.func,
            value: 0,
            show: true,
            disable: true,
            pattern: null,
        }))
    );

    useEffect(() => {
        const subscription = statusBarService.state$.subscribe((state: Nullable<IStatusBarServiceStatus>) => {
            const values = state?.values ?? [];
            setStatistics((previousStatistics) =>
                previousStatistics.map((statistic) => {
                    const value = values.find((item) => item.func === statistic.name);
                    return {
                        ...statistic,
                        value: value?.value ?? statistic.value,
                        disable: !value,
                        pattern: state?.pattern ?? null,
                    };
                })
            );
        });

        return () => subscription.unsubscribe();
    }, [statusBarService]);

    const availableStatistics = statistics.filter((item) => item.show && !item.disable);
    const selectedStatistic = availableStatistics.find((item) => item.name === selectedFunction) ??
        availableStatistics.find((item) => item.name === FUNCTION_NAMES_MATH.SUM) ??
        availableStatistics[0];
    if (!selectedStatistic) {
        return null;
    }

    const formatStatistic = (item: IStatisticItem) => {
        const localeKey = functionDisplayNames[item.name as string] || (item.name as string);
        return `${localeService.t(localeKey)}: ${formatNumber(item)}`;
    };

    const handleSelect = (name: IFunctionNames) => {
        setSelectedFunction(name);
        setOpen(false);
    };

    return (
        <div
            className={`
              univer-relative univer-box-border univer-flex univer-h-full univer-min-w-0 univer-max-w-64
              univer-items-center univer-overflow-hidden univer-px-2
              after:univer-absolute after:univer-right-0 after:univer-top-1/2 after:univer-block after:univer-h-4
              after:univer-w-px after:-univer-translate-y-1/2 after:univer-bg-gray-200 after:univer-content-[""]
            `}
        >
            <Dropdown
                align="end"
                side="top"
                open={open}
                onOpenChange={setOpen}
                overlay={(
                    <div
                        data-u-comp="status-bar-statistic-menu"
                        className={`
                          univer-grid univer-w-max univer-max-w-[calc(100vw-16px)] univer-gap-0.5 univer-p-1.5
                        `}
                    >
                        {availableStatistics.map((item) => {
                            const text = formatStatistic(item);
                            const selected = item.name === selectedStatistic.name;
                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    className={clsx(`
                                      univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded
                                      univer-border-none univer-bg-transparent univer-px-2 univer-py-1.5
                                      univer-text-left univer-text-xs univer-text-gray-900
                                      hover:univer-bg-gray-100
                                      dark:!univer-text-gray-200
                                      dark:hover:!univer-bg-gray-800
                                    `, {
                                        'univer-bg-gray-100 dark:!univer-bg-gray-800': selected,
                                    })}
                                    aria-pressed={selected}
                                    onClick={() => handleSelect(item.name)}
                                >
                                    <span className="univer-w-3 univer-shrink-0">
                                        {selected && <CheckMarkIcon />}
                                    </span>
                                    <Tooltip title={text} placement="top">
                                        <span className="univer-min-w-0 univer-flex-1 univer-truncate">{text}</span>
                                    </Tooltip>
                                </button>
                            );
                        })}
                    </div>
                )}
            >
                <button
                    type="button"
                    data-u-comp="status-bar-statistic-picker"
                    className={`
                      univer-flex univer-min-w-0 univer-max-w-full univer-cursor-pointer univer-items-center
                      univer-gap-1 univer-border-none univer-bg-transparent univer-p-0 univer-text-xs
                      univer-text-gray-400
                    `}
                >
                    <Tooltip title={formatStatistic(selectedStatistic)} placement="top">
                        <span className="univer-min-w-0 univer-flex-1 univer-truncate">
                            {formatStatistic(selectedStatistic)}
                        </span>
                    </Tooltip>
                    <MoreDownIcon className="univer-shrink-0" />
                </button>
            </Dropdown>
        </div>
    );
};
