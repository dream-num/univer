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
import type { ComponentType } from 'react';
import type { IUniverSheetsUIConfig } from '../../controllers/config.schema';
import type { IStatusBarServiceStatus, StatusBarService } from '../../services/status-bar.service';
import type { IStatisticItem } from './CopyableStatisticItem';
import { debounce } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { useConfigValue, useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { IStatusBarService } from '../../services/status-bar.service';
import { CopyableStatisticItem } from './CopyableStatisticItem';

const SINGLE_MODE_WIDTH = 800;
const ROW_COUNT_THRESHOLD = 3;

export const StatusBar = () => {
    const showStatistic = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY)?.statusBarStatistic ?? true;

    const [isSingle, setIsSingle] = useState(window.innerWidth < SINGLE_MODE_WIDTH);

    const statusBarService = useDependency(IStatusBarService);
    // items is six functions: MAX MIN ALL ...
    const items = statusBarService.getFunctions().map((item, index) => ({
        name: item.func,
        value: 0,
        show: true,
        disable: false,
        pattern: null,
    }));

    const useStatistics = (
        initialItems: IStatisticItem[],
        statusBarService: StatusBarService,
        isSingle: boolean,
        showStatistic: boolean
    ) => {
        const [statistics, setStatistics] = useState<IStatisticItem[]>(initialItems);
        const [show, setShow] = useState(true);

        const filteredStatistics = useMemo(() =>
            statistics.filter((item) => item.show && !item.disable), [statistics]);

        const firstItem = useMemo(() =>
            filteredStatistics.find((item) => item.show && !item.disable), [filteredStatistics]);

        const showList = useMemo(() =>
            isSingle && firstItem ? [firstItem] : filteredStatistics, [isSingle, firstItem, filteredStatistics]);

        const updateStatistics = useCallback((state: Nullable<IStatusBarServiceStatus>) => {
            const items = state?.values;
            if (!items?.length) {
                setShow(false);
                return;
            }

            setShow(true);
            setStatistics((prevStats) =>
                prevStats.map((stat) => ({
                    ...stat,
                    value: items.find((i) => i.func === stat.name)?.value ?? stat.value,
                    disable: !items.some((i) => i.func === stat.name),
                    pattern: state?.pattern ?? null,
                }))
            );
        }, []);

        useEffect(() => {
            if (!showStatistic) return;

            const subscription = statusBarService.state$.subscribe(updateStatistics);

            return () => subscription.unsubscribe();
        }, [showStatistic, statusBarService, updateStatistics]);

        return {
            statistics,
            showList,
            show,
        };
    };

    const { showList, show } = useStatistics(
        items,
        statusBarService,
        isSingle,
        showStatistic
    );
    const handleResize = debounce(() => {
        const newSingleState = window.innerWidth < SINGLE_MODE_WIDTH;
        if (isSingle !== newSingleState) {
            setIsSingle(newSingleState);
        }
    }, 100);

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isSingle]);

    const useStatisticLayout = (
        showList: IStatisticItem[],
        rowCountThreshold: number,
        CopyableStatisticItem: ComponentType<IStatisticItem>
    ) => {
        if (!showStatistic) return null;
        const renderContent = useMemo(() => {
            if (showList.length > rowCountThreshold) {
                const doubleLineList = showList.reduce<IStatisticItem[][]>((acc, _, index) => {
                    if (index % 2 === 0) {
                        acc.push(showList.slice(index, index + 2));
                    }
                    return acc;
                }, []);

                return (
                    <>
                        {doubleLineList.map((item, index) => (
                            <div key={`stat-col-${index}`}>
                                {item[0] && (
                                    <CopyableStatisticItem
                                        key={item[0].name}
                                        {...item[0]}
                                    />
                                )}
                                {item[1] && (
                                    <CopyableStatisticItem
                                        key={item[1].name}
                                        {...item[1]}
                                    />
                                )}
                            </div>
                        ))}
                    </>
                );
            }

            return (
                <>
                    {showList.map((item) => (
                        <CopyableStatisticItem
                            key={item.name}
                            {...item}
                        />
                    ))}
                </>
            );
        }, [showList, rowCountThreshold, CopyableStatisticItem]);

        return renderContent;
    };

    const renderContent = useStatisticLayout(showList, ROW_COUNT_THRESHOLD, CopyableStatisticItem);

    return (
        show && (
            <div
                className={clsx(`
                  univer-relative univer-box-border univer-flex univer-items-center univer-px-2
                  after:univer-absolute after:univer-right-0 after:univer-top-1/2 after:univer-block after:univer-h-4
                  after:univer-w-px after:-univer-translate-y-1/2 after:univer-bg-gray-200 after:univer-content-[""]
                `, {
                    'univer-max-w-32': isSingle,
                    'univer-max-w-80': !isSingle,
                })}
            >
                <div className="univer-flex univer-gap-x-2">{renderContent}</div>
            </div>
        )
    );
};
