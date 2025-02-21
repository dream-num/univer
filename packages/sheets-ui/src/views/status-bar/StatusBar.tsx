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

import type { IStatisticItem } from './CopyableStatisticItem';
import { debounce, IConfigService } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import clsx from 'clsx';

import React, { useEffect, useState } from 'react';
import { HIDE_STATUS_BAR_STATISTIC } from '../../controllers/config.schema';
import { IStatusBarService } from '../../services/status-bar.service';
import { CopyableStatisticItem } from './CopyableStatisticItem';
import styles from './index.module.less';

const SINGLE_MODE_WIDTH = 800;
const ROW_COUNT_THRESHOLD = 3;

export const StatusBar = () => {
    const configService = useDependency(IConfigService);
    const hideStatistic = configService.getConfig(HIDE_STATUS_BAR_STATISTIC);

    const [isSingle, setIsSingle] = useState(window.innerWidth < SINGLE_MODE_WIDTH);
    const [show, setShow] = useState(true);

    const statusBarService = useDependency(IStatusBarService);
    const items = statusBarService.getFunctions().map((item, index) => ({
        name: item.func,
        value: 0,
        show: true,
        disable: false,
        pattern: null,
    }));
    const [statistics, setStatistics] = useState<IStatisticItem[]>(items);
    const firstItem = statistics.find((item) => item.show && !item.disable);
    const showList = isSingle && firstItem ? [firstItem] : statistics.filter((item) => item.show && !item.disable);

    useEffect(() => {
        if (hideStatistic) return;
        const subscription = statusBarService.state$.subscribe((state) => {
            const item = state?.values;
            if (!item || item.length === 0) {
                setShow(false);
            } else {
                setShow(true);
                const newStatistics = statistics.map((stat) => {
                    const target = item.find((i) => i.func === stat.name);
                    if (target) {
                        stat.value = target.value;
                        stat.disable = false;
                    } else {
                        stat.disable = true;
                    }
                    stat.pattern = state?.pattern ?? null;
                    return stat;
                });
                setStatistics(newStatistics);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [statusBarService, hideStatistic, statistics]);

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
        CopyableStatisticItem: React.ComponentType<IStatisticItem>
    ) => {
        if (hideStatistic) return null;
        const renderContent = React.useMemo(() => {
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
                            <div
                                key={`stat-col-${index}`}
                                className={styles.statisticListColumn}
                            >
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

    const renderContent = useStatisticLayout(showList,
        ROW_COUNT_THRESHOLD,
        CopyableStatisticItem);

    return (
        show && (
            <div
                className={clsx(styles.statusBar, {
                    [styles.singleMode]: isSingle,
                })}
            >
                <div className={clsx(styles.statisticList)}>{renderContent}</div>
                <div className={styles.statusBarDiv} />
            </div>
        )
    );
};
